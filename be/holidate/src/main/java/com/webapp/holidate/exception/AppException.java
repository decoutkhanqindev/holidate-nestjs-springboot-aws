package com.webapp.holidate.exception;

import com.webapp.holidate.type.ErrorType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class AppException extends RuntimeException {
  ErrorType error;
}
