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
  FULL_NAME_INVALID(400, "Full name must be between 3 and 100 characters"),
  FULL_NAME_NOT_BLANK(400, "Full name is required"),
  PASSWORD_INVALID(400, "Password must be at least 8 characters"),
  PASSWORD_NOT_BLANK(400, "Password is required"),
  EMAIL_INVALID(400, "Email is not valid"),
  EMAIL_NOT_BLANK(400, "Email is required"),
  PHONE_NUMBER_INVALID(400, "Phone number is not valid"),
  DATE_OF_BIRTH_INVALID(400, "Date of birth is not valid"),
  USER_EXISTS(409, "User already exists"),
  USER_NOT_FOUND(401, "User not found"),
  USER_ID_NOT_BLANK(400, "User ID is required"),
  UNAUTHENTICATED(401, "User is not authenticated"),
  INVALID_TOKEN(401, "Token is invalid or expired"),
  TOKEN_NOT_BLANK(400, "Token is required"),
  FORBIDDEN(403, "User is not allowed to access this resource"),
  SEND_EMAIL_FAILED(500, "Failed to send verification email"),
  ;

  int statusCode;
  String message;
}
