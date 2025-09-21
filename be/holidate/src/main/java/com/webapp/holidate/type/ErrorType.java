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

  // validation errors
  NAME_NOT_BLANK(400, "Name is required"),
  DESCRIPTION_NOT_BLANK(400, "Description is required"),
  FULL_NAME_INVALID(400, "Full name must be between 3 and 100 characters"),
  FULL_NAME_NOT_BLANK(400, "Full name is required"),
  PASSWORD_INVALID(400, "Password must be at least 8 characters"),
  PASSWORD_NOT_BLANK(400, "Password is required"),
  EMAIL_INVALID(400, "Email is not valid"),
  EMAIL_NOT_BLANK(400, "Email is required"),
  PHONE_NUMBER_INVALID(400, "Phone number is not valid"),
  USER_EXISTS(409, "User already exists"),
  USER_NOT_FOUND(401, "User not found"),
  USER_ID_NOT_BLANK(400, "User ID is required"),
  UNAUTHORIZED(401, "User is not authorized"),
  ACCESS_DENIED(403, "User is not allowed to access this resource"),
  ONLY_LOCAL_AUTH(400, "This action is only available for local authentication users"),
  TOKEN_NOT_BLANK(400, "Token is required"),
  INVALID_TOKEN(401, "Token is invalid"),
  TOKEN_EXPIRED(401, "Token has expired"),
  CAN_NOT_REFRESH_TOKEN(400, "Cannot refresh token"),
  SEND_EMAIL_FAILED(500, "Failed to send verification email"),
  OTP_NOT_BLANK(400, "OTP is required"),
  OTP_INVALID(400, "OTP must be 6 digits"),
  INVALID_OTP(400, "OTP is invalid"),
  OTP_BLOCKED(429, "Too many failed attempts. Please try again later"),
  OTP_EXPIRED(400, "OTP has expired"),

  // role errors
  ROLE_NOT_FOUND(404, "Role not found"),
  ROLE_EXISTS(409, "Role already exists"),

  // location errors
  COUNTRY_NOT_FOUND(404, "Country not found"),
  COUNTRY_ID_NOT_BLANK(400, "Country ID is required"),
  COUNTRY_CODE_INVALID(400, "Country code must be 2 or 3 characters"),
  COUNTRY_CODE_NOT_BLANK(400, "Country code is required"),
  COUNTRY_EXISTS(409, "Country already exists"),
  PROVINCE_NOT_FOUND(404, "Province not found"),
  PROVINCE_ID_NOT_BLANK(400, "Province ID is required"),
  PROVINCE_CODE_INVALID(400, "Province code must be 2 or 3 characters"),
  PROVINCE_CODE_NOT_BLANK(400, "Province code is required"),
  PROVINCE_EXISTS(409, "Province already exists in this country"),
  CITY_NOT_FOUND(404, "City not found"),
  CITY_ID_NOT_BLANK(400, "City ID is required"),
  CITY_CODE_INVALID(400, "City code must be 2 or 3 characters"),
  CITY_CODE_NOT_BLANK(400, "City code is required"),
  CITY_EXISTS(409, "City already exists in this province"),
  DISTRICT_NOT_FOUND(404, "District not found"),
  DISTRICT_ID_NOT_BLANK(400, "District ID is required"),
  DISTRICT_CODE_INVALID(400, "District code must be 2 or 3 characters"),
  DISTRICT_CODE_NOT_BLANK(400, "District code is required"),
  DISTRICT_EXISTS(409, "District already exists in this city"),
  ;

  int statusCode;
  String message;
}
