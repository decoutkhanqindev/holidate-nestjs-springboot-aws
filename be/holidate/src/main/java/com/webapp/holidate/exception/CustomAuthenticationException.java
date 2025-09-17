package com.webapp.holidate.exception;

import com.webapp.holidate.type.ErrorType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.AuthenticationException;

@Getter
public class CustomAuthenticationException extends AuthenticationException {
  private final ErrorType errorType;

  public CustomAuthenticationException(ErrorType errorType) {
    super(errorType.getMessage());
    this.errorType = errorType;
  }
}
