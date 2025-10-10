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
  public static final String BED_TYPES = "bed_types";

  // policy related tables
  public static final String CANCELLATION_POLICIES = "cancellation_policies";
  public static final String CANCELLATION_RULES = "cancellation_rules";
  public static final String RESCHEDULE_POLICIES = "reschedule_policies";
  public static final String RESCHEDULE_RULES = "reschedule_rules";
  public static final String HOTEL_POLICIES = "hotel_policies";
  public static final String IDENTIFICATION_DOCUMENTS = "identification_documents";
  public static final String CHILDREN_POLICY_RULES = "children_policy_rules";
  public static final String PET_POLICY_RULES = "pet_policy_rules";
  public static final String HOTEL_POLICY_IDENTIFICATION_DOCUMENTS = "hotel_policy_identification_documents";

  // amenity related tables
  public static final String AMENITIES = "amenities";
  public static final String AMENITY_CATEGORIES = "amenity_categories";
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
  public static final String DISCOUNTS = "discounts";
  public static final String HOTEL_DISCOUNTS = "hotel_discounts";
  public static final String SPECIAL_DAY_DISCOUNTS = "special_day_discounts";

  // special day related tables
  public static final String SPECIAL_DAYS = "special_days";

  // images
  public static final String PHOTOS = "photos";
  public static final String PHOTO_CATEGORIES = "photo_categories";
  public static final String HOTEL_PHOTOS = "hotel_photos";
  public static final String ROOM_PHOTOS = "room_photos";
  public static final String ACCOMMODATION_PHOTOS = "accommodation_photos";
  public static final String REVIEW_PHOTOS = "review_photos";
}
