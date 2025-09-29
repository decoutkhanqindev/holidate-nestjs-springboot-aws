package com.webapp.holidate.constants.db;

public class DbTableNames {
  // authentication and authorization related tables
  public static final String ROLES = "roles";
  public static final String USERS = "users";
  public static final String USER_AUTH_INFO = "user_auth_info";
  public static final String INVALID_TOKENS = "invalid_tokens";

  // accommodation related tables
  public static final String HOTELS = "hotels";
  public static final String ROOMS = "rooms";
  public static final String ROOM_INVENTORIES = "room_inventories";
  public static final String AMENITIES = "amenities";
  public static final String HOTEL_AMENITIES = "hotel_amenities";
  public static final String ROOM_AMENITIES = "room_amenities";

  // location related tables
  public static final String COUNTRIES = "countries";
  public static final String PROVINCES = "provinces";
  public static final String CITIES = "cities";
  public static final String DISTRICTS = "districts";
  public static final String WARDS = "wards";
  public static final String STREETS = "streets";

  // booking related tables
  public static final String BOOKINGS = "bookings";
  public static final String BOOKING_ROOMS = "booking_rooms";
  public static final String REVIEWS = "reviews";

  // images
  public static final String ACCOMMODATION_PHOTOS = "accommodation_photos";
}
