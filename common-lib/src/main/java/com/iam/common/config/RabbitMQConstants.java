package com.iam.common.config;

public final class RabbitMQConstants {

    private RabbitMQConstants() {}

    // Exchange
    public static final String EVENTS_EXCHANGE = "iam.events";
    public static final String DEAD_LETTER_EXCHANGE = "iam.dlx";

    // Routing keys
    public static final String AUTH_LOGIN_SUCCESS = "auth.login.success";
    public static final String AUTH_LOGIN_FAILED = "auth.login.failed";
    public static final String AUTH_REGISTER = "auth.register";
    public static final String AUTH_PASSWORD_RESET = "auth.password.reset";
    public static final String AUTH_ADMIN_USER_CREATED = "auth.admin.user-created";
    public static final String AUTH_PASSWORD_CHANGED = "auth.password.changed";

    public static final String USER_CREATED = "user.created";
    public static final String USER_UPDATED = "user.updated";
    public static final String USER_DELETED = "user.deleted";

    public static final String RESOURCE_ACCESS_REQUESTED = "resource.access.requested";
    public static final String RESOURCE_ACCESS_APPROVED = "resource.access.approved";
    public static final String RESOURCE_ACCESS_DENIED = "resource.access.denied";
    public static final String RESOURCE_ACCESS_REVOKED = "resource.access.revoked";
    public static final String RESOURCE_COLLISION_DETECTED = "resource.collision.detected";

    public static final String SECURITY_ALERT = "security.alert";

    // Queues
    public static final String AUDIT_AUTH_QUEUE = "audit.auth.queue";
    public static final String AUDIT_USER_QUEUE = "audit.user.queue";
    public static final String AUDIT_RESOURCE_QUEUE = "audit.resource.queue";
    public static final String AUDIT_SECURITY_QUEUE = "audit.security.queue";

    public static final String NOTIFICATION_WELCOME_QUEUE = "notification.welcome.queue";
    public static final String NOTIFICATION_ACCESS_QUEUE = "notification.access.queue";
    public static final String NOTIFICATION_COLLISION_QUEUE = "notification.collision.queue";
    public static final String NOTIFICATION_SECURITY_QUEUE = "notification.security.queue";
    public static final String NOTIFICATION_LOGIN_FAILED_QUEUE = "notification.login.failed.queue";
    public static final String NOTIFICATION_ADMIN_WELCOME_QUEUE = "notification.admin.welcome.queue";
    public static final String NOTIFICATION_PASSWORD_CHANGED_QUEUE = "notification.password.changed.queue";

    public static final String RESOURCE_COLLISION_CHECK_QUEUE = "resource.collision.check";

    public static final String DEAD_LETTER_QUEUE = "iam.dead-letter-queue";
}
