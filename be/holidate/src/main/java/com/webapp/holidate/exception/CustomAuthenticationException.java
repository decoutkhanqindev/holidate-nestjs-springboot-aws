package com.webapp.holidate.exception;

import com.webapp.holidate.type.ErrorType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.AuthenticationException;

@Builder
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Getter
@Setter
@ToString
public class CustomAuthenticationException extends AuthenticationException {
  ErrorType errorType;

  public CustomAuthenticationException(ErrorType errorType) {
    super(errorType.getMessage());
    this.errorType = errorType;
  }
}
