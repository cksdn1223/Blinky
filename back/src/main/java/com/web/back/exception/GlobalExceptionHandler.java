package com.web.back.exception;

import com.web.back.dto.exception.ErrorResponseRecord;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;


@RestControllerAdvice   // @RestController에서 발생하는 예외를 전역적으로 처리합니다
public class GlobalExceptionHandler {

    // 공통 에러 응답 빌더 메서드
    private ResponseEntity<ErrorResponseRecord> buildErrorResponse(Exception ex, HttpStatus status, WebRequest request) {
        ErrorResponseRecord errorResponseRecord = new ErrorResponseRecord(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        return ResponseEntity
                .status(status)
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponseRecord);
    }

    // 2. 예외 종류에 따른 핸들러 통합 및 재구성
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseRecord> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler({AccessDeniedException.class, PermissionDeniedException.class})
    public ResponseEntity<ErrorResponseRecord> handleForbiddenException(Exception ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
    }

    @ExceptionHandler({BadRequestException.class, MemberMinException.class})
    public ResponseEntity<ErrorResponseRecord> handleBadRequestException(Exception ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler({UsernameNotFoundException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorResponseRecord> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.UNAUTHORIZED, request);
    }

    @ExceptionHandler({
            EmailExistsException.class,
            ParticipantExistsException.class,
            MemberMaxException.class
    })
    public ResponseEntity<ErrorResponseRecord> handleConflictException(Exception ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.CONFLICT, request);
    }

    // 예상치 못한 모든 예외를 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseRecord> handleGlobalException(Exception ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }


    @ExceptionHandler(org.springframework.web.context.request.async.AsyncRequestTimeoutException.class)
    public ResponseEntity<Void> handleAsyncTimeout() {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}