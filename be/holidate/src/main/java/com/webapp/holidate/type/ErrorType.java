package com.webapp.holidate.type;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
@Getter
@ToString
public enum ErrorType {
  UNKNOWN_ERROR(500, "An unexpected error occurred"),
  NAME_NOT_BLANK(400, "Name is required"),
  DESCRIPTION_NOT_BLANK(400, "Description is required"),
  USERNAME_INVALID(400, "Username must be between 3 and 20 characters"),
  USERNAME_NOT_BLANK(400, "Username is required"),
  PASSWORD_INVALID(400, "Password must be at least 8 characters"),
  EMAIL_INVALID(400, "Email is not valid"),
  EMAIL_NOT_BLANK(400, "Email is required"),
  USER_EXISTS(409, "User already exists"),
  USER_NOT_FOUND(401, "User not found"),
  UNAUTHENTICATED(401, "User is not authenticated"),
  FORBIDDEN(403, "User is not allowed to access this resource"),
  ;

  int statusCode;
  String message;
}
