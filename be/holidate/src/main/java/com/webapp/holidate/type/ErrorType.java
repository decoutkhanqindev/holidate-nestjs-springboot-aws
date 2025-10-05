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
  AUTH_PROVIDER_NOT_VALID(400, "Auth provider must be local or google"),
  NAME_NOT_BLANK(400, "Name is required"),
  DESCRIPTION_NOT_BLANK(400, "Description is required"),
  FULL_NAME_INVALID(400, "Full name must be between 3 and 100 characters"),
  FULL_NAME_NOT_BLANK(400, "Full name is required"),
  PASSWORD_INVALID(400, "Password must be at least 8 characters"),
  PASSWORD_NOT_BLANK(400, "Password is required"),
  EMAIL_INVALID(400, "Email is not valid"),
  EMAIL_NOT_BLANK(400, "Email is required"),
  PHONE_NUMBER_INVALID(400, "Phone number is not valid"),
  ADDRESS_NOT_BLANK(400, "Address is required"),
  ROLE_ID_NOT_BLANK(400, "Role ID is required"),
  AUTH_PROVIDER_NOT_BLANK(400, "Auth provider is required"),
  GENDER_INVALID(400, "Gender must be male, female, or other"),
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

  // date errors
  DATE_UTC_NOT_BLANK(400, "Date is required"),
  DATE_UTC_INVALID(400, "Date must be in UTC format"),

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
  WARD_NOT_FOUND(404, "Ward not found"),
  WARD_ID_NOT_BLANK(400, "Ward ID is required"),
  WARD_CODE_INVALID(400, "Ward code must be 2 to 5 characters"),
  WARD_CODE_NOT_BLANK(400, "Ward code is required"),
  WARD_EXISTS(409, "Ward already exists in this district"),
  STREET_NOT_FOUND(404, "Street not found"),
  STREET_ID_NOT_BLANK(400, "Street ID is required"),
  STREET_CODE_INVALID(400, "Street code must be 2 to 5 characters"),
  STREET_CODE_NOT_BLANK(400, "Street code is required"),
  STREET_EXISTS(409, "Street already exists in this ward"),

  // accommodation errors
  LATITUDE_INVALID(400, "Latitude must be between -90.0 and 90.0"),
  LONGITUDE_INVALID(400, "Longitude must be between -180.0 and 180.0"),
  PARTNER_ID_NOT_BLANK(400, "Partner ID is required"),

  // hotel errors
  HOTEL_NOT_FOUND(404, "Hotel not found"),
  HOTEL_EXISTS(409, "Hotel already exists"),
  HOTEL_STATUS_NOT_BLANK(400, "Hotel status is required"),
  HOTEL_STATUS_INVALID(400, "Hotel status must be active, inactive, maintenance, or closed"),

  // room errors
  HOTEL_ID_NOT_BLANK(400, "Hotel ID is required"),
  ROOM_NOT_FOUND(404, "Room not found"),
  ROOM_EXISTS(409, "Room already exists in this hotel"),
  ROOM_ID_NOT_BLANK(400, "Room ID is required"),
  CANCELLATION_POLICY_ID_NOT_BLANK(400, "Cancellation policy ID is required"),
  ROOM_STATUS_NOT_BLANK(400, "Room status is required"),
  ROOM_STATUS_INVALID(400, "Room status must be available, booked, maintenance, or closed"),
  VIEW_NOT_BLANK(400, "View is required"),
  AREA_MUST_BE_POSITIVE(400, "Area must be a positive number"),
  MAX_ADULTS_MUST_BE_POSITIVE(400, "Max adults must be a positive number"),
  MAX_CHILDREN_MUST_BE_POSITIVE_OR_ZERO(400, "Max children must be zero or a positive number"),
  PRICE_MUST_BE_POSITIVE(400, "Base price per night must be a positive number"),
  QUANTITY_MUST_BE_POSITIVE(400, "Quantity must be a positive number"),
  BED_TYPE_ID_NOT_BLANK(400, "Bed type ID is required"),
  SMOKING_ALLOWED_NOT_BLANK(400, "Smoking allowed is required"),
  WIFI_AVAILABLE_NOT_BLANK(400, "WiFi available is required"),
  BREAKFAST_INCLUDED_NOT_BLANK(400, "Breakfast included is required"),
  AMENITY_IDS_NOT_EMPTY(400, "At least one amenity ID is required"),
  BED_TYPE_NOT_FOUND(404, "Bed type not found"),
  START_DATE_NOT_BLANK(400, "Start date is required"),
  END_DATE_NOT_BLANK(400, "End date is required"),

  // discount errors
  HOLIDAY_DISCOUNT_NOT_FOUND(404, "SpecialDay discount not found"),
  HOLIDAY_DISCOUNT_EXISTS(409, "SpecialDay discount already exists"),

  // policy errors
  CHECK_IN_OUT_TIME_INVALID(400, "Check-in and check-out time must be in HH:mm format"),
  CANCELLATION_POLICY_NOT_FOUND(404, "Cancellation policy not found"),
  RESCHEDULE_POLICY_NOT_FOUND(404, "Reschedule policy not found"),
  PET_POLICY_RULE_NOT_FOUND(404, "Pet policy rule not found"),
  CHILDREN_POLICY_RULE_NOT_FOUND(404, "Children policy rule not found"),
  IDENTIFICATION_DOCUMENT_NOT_FOUND(404, "Identification document not found"),

  // amenity errors
  AMENITY_CATEGORY_EXISTS(409, "Amenity category already exists"),
  AMENITY_CATEGORY_NOT_FOUND(404, "Amenity category not found"),
  AMENITY_CATEGORY_ID_NOT_BLANK(400, "Amenity category ID is required"),
  AMENITY_EXISTS(409, "Amenity already exists"),
  AMENITY_NOT_FOUND(404, "Amenity not found"),
  IS_FREE_NOT_BLANK(400, "Is free is required"),

  // image errors
  PHOTOS_NOT_BLANK(400, "Photos are required"),
  PHOTO_FILES_NOT_EMPTY(400, "At least one photo file is required"),
  PHOTO_IDS_NOT_EMPTY(400, "At least one photo ID is required"),
  PHOTO_NOT_FOUND(404, "Photo not found"),
  PHOTO_CATEGORY_ID_NOT_BLANK(400, "Photo category ID is required"),
  PHOTO_CATEGORY_NOT_FOUND(404, "Photo category not found"),
  ;

  int statusCode;
  String message;
}
