package com.webapp.holidate.constants.api.param;

public class BookingParams {
  // Entity ID filters (shared across different contexts)
  public static final String USER_ID = "user-id";
  public static final String ROOM_ID = "room-id";
  public static final String HOTEL_ID = "hotel-id";
  public static final String BOOKING_ID = "booking-id";

  // Booking-specific filters
  public static final String CHECK_IN_DATE = "check-in-date";
  public static final String CHECK_OUT_DATE = "check-out-date";
  public static final String CONTACT_EMAIL = "contact-email";
  public static final String CONTACT_PHONE = "contact-phone";
  public static final String CONTACT_FULL_NAME = "contact-full-name";

  // Sort fields
  public static final String CHECK_IN_DATE_SORT = "check-in-date";
  public static final String CHECK_OUT_DATE_SORT = "check-out-date";
  public static final String FINAL_PRICE = "final-price";
  public static final String STATUS_SORT = "status";
}
