package com.example.ktbapi.common;

import com.example.ktbapi.common.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

@Order(Ordered.LOWEST_PRECEDENCE)
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static ResponseEntity<ApiResponse<Void>> error(HttpStatus status, String code, Object detail) {
        return ResponseEntity.status(status).body(ApiResponse.error(code, detail));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> unauthorized(UnauthorizedException ex) {
        return error(HttpStatus.UNAUTHORIZED, ex.getMessage(), null);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> notFound(NotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiResponse<Void>> invalid(InvalidRequestException ex) {
        HttpStatus status = "duplicate_user".equals(ex.getMessage())
                ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
        return error(status, ex.getMessage(), null);
    }

    @ExceptionHandler(AlreadyLikedException.class)
    public ResponseEntity<ApiResponse<Void>> alreadyLiked(AlreadyLikedException e) {
        return error(HttpStatus.CONFLICT, "already_liked", null);
    }

    @ExceptionHandler(NotLikedException.class)
    public ResponseEntity<ApiResponse<Void>> notLiked(NotLikedException e) {
        return error(HttpStatus.BAD_REQUEST, "not_liked", null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> validation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        return error(HttpStatus.BAD_REQUEST, "invalid_request", fieldErrors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> notReadable(HttpMessageNotReadableException ex) {
        String msg = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();
        return error(HttpStatus.BAD_REQUEST, "invalid_json", msg);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> typeMismatch(MethodArgumentTypeMismatchException ex) {
        Map<String, Object> detail = Map.of(
                "name", ex.getName(),
                "requiredType", ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : null,
                "value", ex.getValue()
        );
        return error(HttpStatus.BAD_REQUEST, "type_mismatch", detail);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> noHandler(NoHandlerFoundException ex) {
        Map<String, Object> detail = Map.of(
                "path", ex.getRequestURL(),
                "httpMethod", ex.getHttpMethod()
        );
        return error(HttpStatus.NOT_FOUND, "not_found", detail);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> noResource(NoResourceFoundException ex, HttpServletRequest request) {
        String path = request.getRequestURI(); 
        if (path != null && (path.contains("/swagger-ui") || path.contains("/v3/api-docs")
                || path.contains("/webjars") || path.contains("/favicon"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Map<String, Object> detail = Map.of(
                "path", path,
                "httpMethod", request.getMethod()
        );
        return error(HttpStatus.NOT_FOUND, "not_found", detail);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> methodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        Map<String, Object> detail = Map.of(
                "method", ex.getMethod(),
                "supported", ex.getSupportedHttpMethods()
        );
        return error(HttpStatus.METHOD_NOT_ALLOWED, "method_not_allowed", detail);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> unexpected(Exception ex) {
        log.error("💥 Unexpected error", ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "internal_error", null);
    }
}
