package com.webapp.holidate.constants.api.param;

public class DiscountParams {
  // Filter parameters
  public static final String CODE = "code";
  public static final String ACTIVE = "active";
  public static final String VALID_FROM = "valid-from";
  public static final String VALID_TO = "valid-to";
  public static final String CURRENTLY_VALID = "currently-valid";

  // Booking price filters
  public static final String MIN_BOOKING_PRICE = "min-booking-price";
  public static final String MAX_BOOKING_PRICE = "max-booking-price";

  // Booking count filters
  public static final String MIN_BOOKING_COUNT = "min-booking-count";
  public static final String MAX_BOOKING_COUNT = "max-booking-count";

  // Usage filters
  public static final String AVAILABLE = "available";
  public static final String EXHAUSTED = "exhausted";
  public static final String MIN_TIMES_USED = "min-times-used";
  public static final String MAX_TIMES_USED = "max-times-used";

  // Relationship filters
  public static final String SPECIAL_DAY_ID = "special-day-id";

  // Sort fields
  public static final String PERCENTAGE = "percentage";
  public static final String USAGE_LIMIT = "usage-limit";
  public static final String TIMES_USED = "times-used";
}
