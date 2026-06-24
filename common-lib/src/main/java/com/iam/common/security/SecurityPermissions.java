package com.iam.common.security;

public final class SecurityPermissions {

    private SecurityPermissions() {}

    // User permissions
    public static final String USER_READ = "user:read";
    public static final String USER_WRITE = "user:write";
    public static final String USER_DELETE = "user:delete";
    public static final String ROLE_MANAGE = "role:manage";

    // Resource permissions
    public static final String RESOURCE_READ = "resource:read";
    public static final String RESOURCE_WRITE = "resource:write";
    public static final String RESOURCE_DELETE = "resource:delete";
    public static final String RESOURCE_REQUEST = "resource:request";
    public static final String RESOURCE_APPROVE = "resource:approve";

    // Audit permissions
    public static final String AUDIT_READ = "audit:read";
    public static final String AUDIT_EXPORT = "audit:export";

    // System permissions
    public static final String SYSTEM_CONFIG = "system:config";
}
