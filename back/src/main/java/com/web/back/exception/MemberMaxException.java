package com.web.back.exception;

public class MemberMaxException extends RuntimeException {
    public MemberMaxException(String message) {
        super(message);
    }
}
