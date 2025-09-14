package com.webapp.holidate.exception;

import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.type.ErrorType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Objects;

@Slf4j
@ControllerAdvice
public class AppExceptionHandler {
  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<ApiResponse<String>> handleRuntimeException(RuntimeException e) {
    log.error("handleRuntimeException resolve error: ", e);

    ApiResponse<String> response = ApiResponse.<String>builder()
      .statusCode(ErrorType.UNKNOWN_ERROR.getStatusCode())
      .message(ErrorType.UNKNOWN_ERROR.getMessage())
      .data(null)
      .build();
    return ResponseEntity.status(ErrorType.UNKNOWN_ERROR.getStatusCode()).body(response);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<String>> handleValidationException(MethodArgumentNotValidException e) {
    log.error("handleValidationException resolve error: ", e);

    String message = Objects.requireNonNull(e.getFieldError()).getDefaultMessage();
    ErrorType error = ErrorType.valueOf(message);
    ApiResponse<String> response = ApiResponse.<String>builder()
      .statusCode(error.getStatusCode())
      .message(error.getMessage())
      .data(null)
      .build();
    return ResponseEntity.status(error.getStatusCode()).body(response);
  }

  @ExceptionHandler(AppException.class)
  public ResponseEntity<ApiResponse<String>> handleAppException(AppException e) {
    log.error("handleAppException resolve error: ", e);

    ApiResponse<String> response = ApiResponse.<String>builder()
      .statusCode(e.getError().getStatusCode())
      .message(e.getError().getMessage())
      .data(null)
      .build();
    return ResponseEntity.status(e.getError().getStatusCode()).body(response);
  }
}
