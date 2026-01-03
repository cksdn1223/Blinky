package com.web.back.exception;

public class ParticipantExistsException extends RuntimeException {
    public ParticipantExistsException(String message) {
        super(message);
    }
}
