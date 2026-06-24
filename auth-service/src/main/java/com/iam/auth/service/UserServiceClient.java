package com.iam.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Internal HTTP client to fetch user roles from user-service.
 * Falls back to "USER" if the call fails.
 */
@Component
public class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);

    private final RestTemplate restTemplate;

    @Value("${services.user-service.url:http://localhost:8082}")
    private String userServiceUrl;

    public UserServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Fetches the user's current roles from user-service.
     * Returns comma-separated roles string (e.g. "ADMIN,USER").
     * Falls back to "USER" on any error.
     */
    public String getUserRoles(UUID userId, String email) {
        try {
            String url = userServiceUrl + "/api/v1/users/" + userId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", userId.toString());
            headers.set("X-User-Email", email);
            headers.set("X-User-Roles", "ADMIN");
            headers.set("X-User-Permissions", "user:read");

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Object data = body.get("data");
                if (data instanceof Map) {
                    Object roles = ((Map<?, ?>) data).get("roles");
                    if (roles instanceof Collection) {
                        String rolesStr = String.join(",", (Collection<String>) roles);
                        log.info("Fetched roles for user {}: {}", userId, rolesStr);
                        return rolesStr.isEmpty() ? "USER" : rolesStr;
                    }
                }
            }

            log.warn("Could not parse roles from user-service response for user {}", userId);
            return "USER";
        } catch (Exception e) {
            log.warn("Failed to fetch roles from user-service for user {}: {}", userId, e.getMessage());
            return "USER";
        }
    }

    /**
     * Fetches the user's current permissions from user-service.
     * Returns comma-separated permissions string.
     * Falls back to empty string on any error.
     */
    public String getUserPermissions(UUID userId, String email) {
        // Permissions are derived from roles in the user-service
        // For now, return empty and let the gateway/services handle it
        return "";
    }
}
