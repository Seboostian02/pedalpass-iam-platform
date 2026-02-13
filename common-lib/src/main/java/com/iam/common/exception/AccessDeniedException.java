package com.iam.common.exception;

import org.springframework.http.HttpStatus;

public class AccessDeniedException extends BaseException {

    public AccessDeniedException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }

    public AccessDeniedException() {
        super("Access denied", HttpStatus.FORBIDDEN);
    }
}
