package com.webapp.holidate.exception;

import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.utils.ResponseUtil;
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
    return ResponseUtil.handleExceptionResponse(ErrorType.UNKNOWN_ERROR);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<String>> handleValidationException(MethodArgumentNotValidException e) {
    log.error("handleValidationException resolve error: ", e);

    String message = Objects.requireNonNull(e.getFieldError()).getDefaultMessage();
    ErrorType error = ErrorType.valueOf(message);
    return ResponseUtil.handleExceptionResponse(error);
  }

  @ExceptionHandler(AppException.class)
  public ResponseEntity<ApiResponse<String>> handleAppException(AppException e) {
    log.error("handleAppException resolve error: ", e);
    return ResponseUtil.handleExceptionResponse(e.getError());
  }
}
