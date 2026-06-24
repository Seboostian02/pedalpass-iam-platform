package com.iam.notification.service;

import com.iam.notification.dto.UpdatePreferenceRequest;
import com.iam.notification.model.Notification;
import com.iam.notification.model.NotificationPreference;
import com.iam.notification.repository.NotificationPreferenceRepository;
import com.iam.notification.repository.NotificationRepository;
import com.iam.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String mailFrom;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationPreferenceRepository preferenceRepository,
                               JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.mailSender = mailSender;
    }

    @Transactional
    public Notification createAndSendNotification(UUID userId, String userEmail,
                                                   String title, String message,
                                                   String notificationType) {
        boolean shouldEmail;
        boolean shouldInApp;

        if (userId != null) {
            var prefOpt = preferenceRepository.findByUserIdAndNotificationType(userId, notificationType);
            NotificationPreference pref;
            if (prefOpt.isPresent()) {
                pref = prefOpt.get();
            } else {
                // Auto-create preference on first notification of this type (defaults: both enabled)
                pref = preferenceRepository.save(NotificationPreference.builder()
                        .userId(userId)
                        .notificationType(notificationType)
                        .build());
                log.info("Auto-created preference for user {} type {} (email={}, inApp={})",
                        userId, notificationType, pref.isEmailEnabled(), pref.isInAppEnabled());
            }
            shouldEmail = pref.isEmailEnabled();
            shouldInApp = pref.isInAppEnabled();
        } else {
            shouldEmail = false;
            shouldInApp = false;
        }

        if (!shouldInApp && !shouldEmail) {
            log.info("Notification suppressed for user {} (type {}): both channels disabled",
                    userEmail, notificationType);
            return null;
        }

        // If userId is null (e.g. login failed), only send email - cannot save in-app notification
        if (userId == null) {
            if (shouldEmail) {
                sendEmail(userEmail, title, message);
                log.info("Email-only notification sent to {}: {}", userEmail, title);
            }
            return null;
        }

        Notification notification = Notification.builder()
                .userId(userId)
                .userEmail(userEmail)
                .title(title)
                .message(message)
                .notificationType(notificationType)
                .build();

        if (shouldEmail) {
            sendEmail(userEmail, title, message);
            notification.setEmailSent(true);
        }

        if (shouldInApp) {
            notification = notificationRepository.save(notification);
            log.info("Notification sent to {}: {}", userEmail, title);
        }

        return notification;
    }

    public Page<Notification> getUserNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Page<Notification> getUnreadNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId, pageable);
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void deleteNotification(UUID notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification", "id", notificationId.toString());
        }
        notificationRepository.deleteById(notificationId);
    }

    public List<NotificationPreference> getPreferences(UUID userId) {
        return preferenceRepository.findByUserId(userId);
    }

    @Transactional
    public NotificationPreference updatePreference(UUID userId, UpdatePreferenceRequest request) {
        NotificationPreference pref = preferenceRepository
                .findByUserIdAndNotificationType(userId, request.getNotificationType())
                .orElseGet(() -> NotificationPreference.builder()
                        .userId(userId)
                        .notificationType(request.getNotificationType())
                        .build());

        pref.setEmailEnabled(request.getEmailEnabled());
        pref.setInAppEnabled(request.getInAppEnabled());
        return preferenceRepository.save(pref);
    }

    public void sendEmailDirect(String to, String subject, String body) {
        sendEmail(to, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(mailFrom);
            mail.setTo(to);
            mail.setSubject("[IAM Platform] " + subject);
            mail.setText(body);
            mailSender.send(mail);
            log.debug("Email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
