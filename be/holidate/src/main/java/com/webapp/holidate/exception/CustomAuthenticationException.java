package com.webapp.holidate.exception;

import com.webapp.holidate.type.ErrorType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.AuthenticationException;

@Getter
public class CustomAuthenticationException extends AuthenticationException {
  private final ErrorType error;

  public CustomAuthenticationException(ErrorType error) {
    super(error.getMessage());
    this.error = error;
  }
}
