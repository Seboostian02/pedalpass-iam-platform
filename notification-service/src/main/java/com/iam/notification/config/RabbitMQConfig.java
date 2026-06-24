package com.iam.notification.config;

import com.iam.common.config.RabbitMQConstants;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange iamEventsExchange() {
        return new TopicExchange(RabbitMQConstants.EVENTS_EXCHANGE);
    }

    // Welcome email on registration
    @Bean
    public Queue notifWelcomeQueue() {
        return QueueBuilder.durable("notification.welcome.queue").build();
    }

    @Bean
    public Binding notifWelcomeBinding() {
        return BindingBuilder.bind(notifWelcomeQueue())
                .to(iamEventsExchange())
                .with(RabbitMQConstants.AUTH_REGISTER);
    }

    // Access request notifications
    @Bean
    public Queue notifAccessQueue() {
        return QueueBuilder.durable("notification.access.queue").build();
    }

    @Bean
    public Binding notifAccessRequestedBinding() {
        return BindingBuilder.bind(notifAccessQueue())
                .to(iamEventsExchange())
                .with("resource.access.*");
    }

    // Collision notifications
    @Bean
    public Queue notifCollisionQueue() {
        return QueueBuilder.durable("notification.collision.queue").build();
    }

    @Bean
    public Binding notifCollisionBinding() {
        return BindingBuilder.bind(notifCollisionQueue())
                .to(iamEventsExchange())
                .with("resource.collision.*");
    }

    // Security alert notifications
    @Bean
    public Queue notifSecurityQueue() {
        return QueueBuilder.durable("notification.security.queue").build();
    }

    @Bean
    public Binding notifSecurityBinding() {
        return BindingBuilder.bind(notifSecurityQueue())
                .to(iamEventsExchange())
                .with("security.alert.*");
    }

    // Failed login notifications
    @Bean
    public Queue notifLoginFailedQueue() {
        return QueueBuilder.durable("notification.login.failed.queue").build();
    }

    @Bean
    public Binding notifLoginFailedBinding() {
        return BindingBuilder.bind(notifLoginFailedQueue())
                .to(iamEventsExchange())
                .with(RabbitMQConstants.AUTH_LOGIN_FAILED);
    }

    // Admin welcome email (with temp password)
    @Bean
    public Queue notifAdminWelcomeQueue() {
        return QueueBuilder.durable(RabbitMQConstants.NOTIFICATION_ADMIN_WELCOME_QUEUE).build();
    }

    @Bean
    public Binding notifAdminWelcomeBinding() {
        return BindingBuilder.bind(notifAdminWelcomeQueue())
                .to(iamEventsExchange())
                .with(RabbitMQConstants.AUTH_ADMIN_USER_CREATED);
    }

    // Account locked notification
    @Bean
    public Queue notifAccountLockedQueue() {
        return QueueBuilder.durable(RabbitMQConstants.NOTIFICATION_ACCOUNT_LOCKED_QUEUE).build();
    }

    @Bean
    public Binding notifAccountLockedBinding() {
        return BindingBuilder.bind(notifAccountLockedQueue())
                .to(iamEventsExchange())
                .with(RabbitMQConstants.AUTH_ACCOUNT_LOCKED);
    }

    // Password changed notification
    @Bean
    public Queue notifPasswordChangedQueue() {
        return QueueBuilder.durable(RabbitMQConstants.NOTIFICATION_PASSWORD_CHANGED_QUEUE).build();
    }

    @Bean
    public Binding notifPasswordChangedBinding() {
        return BindingBuilder.bind(notifPasswordChangedQueue())
                .to(iamEventsExchange())
                .with(RabbitMQConstants.AUTH_PASSWORD_CHANGED);
    }

    // Password reset notification
    @Bean
    public Queue notifPasswordResetQueue() {
        return QueueBuilder.durable(RabbitMQConstants.NOTIFICATION_PASSWORD_RESET_QUEUE).build();
    }

    @Bean
    public Binding notifPasswordResetBinding() {
        return BindingBuilder.bind(notifPasswordResetQueue())
                .to(iamEventsExchange())
                .with(RabbitMQConstants.AUTH_PASSWORD_RESET);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
