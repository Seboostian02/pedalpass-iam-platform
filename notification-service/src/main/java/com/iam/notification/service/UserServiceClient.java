package com.iam.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

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
     * Fetches emails of all active users with the given role from user-service.
     */
    @SuppressWarnings("unchecked")
    public List<String> getEmailsByRole(String roleName) {
        try {
            String url = userServiceUrl + "/api/v1/users/by-role/" + roleName;

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", "system");
            headers.set("X-User-Email", "system@iam-platform.local");
            headers.set("X-User-Roles", "ADMIN");
            headers.set("X-User-Permissions", "user:read");

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Object data = body.get("data");
                if (data instanceof List<?> users) {
                    List<String> emails = new ArrayList<>();
                    for (Object user : users) {
                        if (user instanceof Map<?, ?> userMap) {
                            Object email = userMap.get("email");
                            if (email instanceof String) {
                                emails.add((String) email);
                            }
                        }
                    }
                    log.debug("Found {} users with role {}", emails.size(), roleName);
                    return emails;
                }
            }

            log.warn("Could not parse users from user-service response for role {}", roleName);
            return Collections.emptyList();
        } catch (Exception e) {
            log.warn("Failed to fetch users by role {} from user-service: {}", roleName, e.getMessage());
            return Collections.emptyList();
        }
    }
}
