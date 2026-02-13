package com.iam.auth.service;

import com.iam.auth.dto.*;
import com.iam.auth.model.RefreshToken;
import com.iam.auth.model.UserCredential;
import com.iam.auth.repository.RefreshTokenRepository;
import com.iam.auth.repository.UserCredentialRepository;
import com.iam.common.exception.BaseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserCredentialRepository userCredentialRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthEventPublisher eventPublisher;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserServiceClient userServiceClient;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Value("${auth.max-failed-attempts}")
    private int maxFailedAttempts;

    @Value("${auth.lockout-duration-minutes}")
    private int lockoutDurationMinutes;

    public AuthService(UserCredentialRepository userCredentialRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthEventPublisher eventPublisher,
                       RedisTemplate<String, String> redisTemplate,
                       UserServiceClient userServiceClient) {
        this.userCredentialRepository = userCredentialRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.eventPublisher = eventPublisher;
        this.redisTemplate = redisTemplate;
        this.userServiceClient = userServiceClient;
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userCredentialRepository.existsByEmail(request.getEmail())) {
            throw new BaseException("Email already registered", HttpStatus.CONFLICT);
        }

        UserCredential credential = UserCredential.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        credential = userCredentialRepository.save(credential);

        String accessToken = jwtService.generateAccessToken(
                credential.getId(), credential.getEmail(), "USER", "");

        RefreshToken refreshToken = createRefreshToken(credential.getId(), credential.getEmail());

        eventPublisher.publishRegistration(credential.getId(), credential.getEmail());
        eventPublisher.publishUserCreated(credential.getId(), credential.getEmail(),
                credential.getFirstName(), credential.getLastName());

        log.info("User registered: {}", credential.getEmail());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration() / 1000)
                .email(credential.getEmail())
                .firstName(credential.getFirstName())
                .lastName(credential.getLastName())
                .build();
    }

    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress) {
        UserCredential credential = userCredentialRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    eventPublisher.publishLoginFailed(request.getEmail(), ipAddress, "User not found");
                    return new BaseException("Invalid email or password", HttpStatus.UNAUTHORIZED);
                });

        if (credential.isLocked()) {
            if (credential.getLockExpiresAt() != null && credential.getLockExpiresAt().isAfter(LocalDateTime.now())) {
                eventPublisher.publishLoginFailed(request.getEmail(), ipAddress, "Account locked");
                throw new BaseException("Account is locked. Try again later.", HttpStatus.LOCKED);
            }
            credential.setLocked(false);
            credential.setFailedAttempts(0);
            credential.setLockExpiresAt(null);
        }

        if (!passwordEncoder.matches(request.getPassword(), credential.getPasswordHash())) {
            handleFailedLogin(credential, ipAddress);
            throw new BaseException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        if (!credential.isActive()) {
            throw new BaseException("Account is deactivated", HttpStatus.FORBIDDEN);
        }

        credential.setFailedAttempts(0);
        userCredentialRepository.save(credential);

        String roles = userServiceClient.getUserRoles(credential.getId(), credential.getEmail());
        String permissions = userServiceClient.getUserPermissions(credential.getId(), credential.getEmail());

        String accessToken = jwtService.generateAccessToken(
                credential.getId(), credential.getEmail(), roles, permissions);

        RefreshToken refreshToken = createRefreshToken(credential.getId(), credential.getEmail());

        eventPublisher.publishLoginSuccess(credential.getId(), credential.getEmail(), ipAddress);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration() / 1000)
                .email(credential.getEmail())
                .firstName(credential.getFirstName())
                .lastName(credential.getLastName())
                .build();
    }

    @Transactional
    public LoginResponse refreshToken(TokenRefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenAndRevokedFalse(request.getRefreshToken())
                .orElseThrow(() -> new BaseException("Invalid refresh token", HttpStatus.UNAUTHORIZED));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BaseException("Refresh token expired", HttpStatus.UNAUTHORIZED);
        }

        UserCredential credential = userCredentialRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new BaseException("User not found", HttpStatus.NOT_FOUND));

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        String roles = userServiceClient.getUserRoles(credential.getId(), credential.getEmail());
        String permissions = userServiceClient.getUserPermissions(credential.getId(), credential.getEmail());

        String accessToken = jwtService.generateAccessToken(
                credential.getId(), credential.getEmail(), roles, permissions);
        RefreshToken newRefreshToken = createRefreshToken(credential.getId(), credential.getEmail());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration() / 1000)
                .email(credential.getEmail())
                .firstName(credential.getFirstName())
                .lastName(credential.getLastName())
                .build();
    }

    @Transactional
    public void logout(String accessToken) {
        long ttl = jwtService.getAccessTokenExpiration() / 1000;
        redisTemplate.opsForValue().set("blacklist:" + accessToken, "true", ttl, TimeUnit.SECONDS);

        // Revoke all refresh tokens for this user
        UUID userId = UUID.fromString(jwtService.parseToken(accessToken).getSubject());
        refreshTokenRepository.revokeAllByUserId(userId);

        log.info("Token blacklisted and refresh tokens revoked for user {}", userId);
    }

    @Transactional
    public void adminCreateUser(AdminCreateUserRequest request, UUID adminUserId) {
        if (userCredentialRepository.existsByEmail(request.getEmail())) {
            throw new BaseException("Email already registered", HttpStatus.CONFLICT);
        }

        String tempPassword = generateSecurePassword();

        UserCredential credential = UserCredential.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(tempPassword))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        credential = userCredentialRepository.save(credential);

        eventPublisher.publishUserCreated(
                credential.getId(), credential.getEmail(),
                credential.getFirstName(), credential.getLastName(),
                request.getRoleName(), request.getDepartmentId());

        eventPublisher.publishAdminUserCreated(
                credential.getId(), credential.getEmail(),
                credential.getFirstName(), credential.getLastName(),
                tempPassword);

        log.info("Admin {} created user: {}", adminUserId, credential.getEmail());
    }

    private String generateSecurePassword() {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "@$!%*?&";
        String all = upper + lower + digits + special;
        SecureRandom random = new SecureRandom();

        StringBuilder password = new StringBuilder(16);
        password.append(upper.charAt(random.nextInt(upper.length())));
        password.append(lower.charAt(random.nextInt(lower.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(special.charAt(random.nextInt(special.length())));
        for (int i = 4; i < 16; i++) {
            password.append(all.charAt(random.nextInt(all.length())));
        }
        char[] chars = password.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }
        return new String(chars);
    }

    private RefreshToken createRefreshToken(UUID userId, String email) {
        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .userId(userId)
                .email(email)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000))
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    private void handleFailedLogin(UserCredential credential, String ipAddress) {
        credential.setFailedAttempts(credential.getFailedAttempts() + 1);
        if (credential.getFailedAttempts() >= maxFailedAttempts) {
            credential.setLocked(true);
            credential.setLockExpiresAt(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
            log.warn("Account locked for {}: too many failed attempts", credential.getEmail());
        }
        userCredentialRepository.save(credential);
        eventPublisher.publishLoginFailed(credential.getEmail(), ipAddress,
                "Invalid password (attempt " + credential.getFailedAttempts() + ")");
    }
}
