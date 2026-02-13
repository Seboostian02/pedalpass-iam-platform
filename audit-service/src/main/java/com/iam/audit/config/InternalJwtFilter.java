package com.iam.audit.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class InternalJwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String userId = request.getHeader("X-User-Id");
        String userEmail = request.getHeader("X-User-Email");
        String userRoles = request.getHeader("X-User-Roles");
        String userPermissions = request.getHeader("X-User-Permissions");

        if (userId != null && userEmail != null) {
            List<SimpleGrantedAuthority> authorities = buildAuthorities(userRoles, userPermissions);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            authentication.setDetails(Map.of(
                    "email", userEmail,
                    "roles", userRoles != null ? userRoles : "",
                    "permissions", userPermissions != null ? userPermissions : ""
            ));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private List<SimpleGrantedAuthority> buildAuthorities(String roles, String permissions) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        if (roles != null && !roles.isBlank()) {
            authorities.addAll(
                    Arrays.stream(roles.split(","))
                            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim()))
                            .collect(Collectors.toList())
            );
        }

        if (permissions != null && !permissions.isBlank()) {
            authorities.addAll(
                    Arrays.stream(permissions.split(","))
                            .map(perm -> new SimpleGrantedAuthority(perm.trim()))
                            .collect(Collectors.toList())
            );
        }

        return authorities;
    }
}
