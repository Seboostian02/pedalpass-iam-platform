package com.iam.user.listener;

import com.iam.common.events.UserEvent;
import com.iam.user.config.RabbitMQConfig;
import com.iam.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class UserEventListener {

    private static final Logger log = LoggerFactory.getLogger(UserEventListener.class);

    private final UserService userService;

    public UserEventListener(UserService userService) {
        this.userService = userService;
    }

    @RabbitListener(queues = RabbitMQConfig.USER_SYNC_QUEUE)
    public void handleUserCreated(UserEvent event) {
        log.info("Received user.created event for: {} ({})", event.getEmail(), event.getUserId());
        try {
            userService.createUserFromEvent(
                    event.getUserId(),
                    event.getEmail(),
                    event.getFirstName(),
                    event.getLastName(),
                    event.getRoleName(),
                    event.getDepartmentId()
            );
        } catch (Exception e) {
            log.error("Failed to sync user from auth-service: {}", e.getMessage(), e);
        }
    }
}
