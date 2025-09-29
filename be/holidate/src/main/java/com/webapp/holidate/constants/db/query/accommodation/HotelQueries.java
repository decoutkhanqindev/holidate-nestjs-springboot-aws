package com.webapp.holidate.constants.db.query.accommodation;

public class HotelQueries {
  public static final String FIND_ALL_WITH_LOCATIONS_PHOTOS_PARTNER =
    "SELECT h FROM Hotel h " +
      "LEFT JOIN FETCH h.country " +
      "LEFT JOIN FETCH h.province " +
      "LEFT JOIN FETCH h.city " +
      "LEFT JOIN FETCH h.district " +
      "LEFT JOIN FETCH h.ward " +
      "LEFT JOIN FETCH h.street " +
      "LEFT JOIN FETCH h.photos " +
      "LEFT JOIN FETCH h.partner";

  public static final String FIND_BY_ID_WITH_LOCATIONS_PHOTOS_AMENITIES_REVIEWS_PARTNER =
    "SELECT h FROM Hotel h " +
      "LEFT JOIN FETCH h.country " +
      "LEFT JOIN FETCH h.province " +
      "LEFT JOIN FETCH h.city " +
      "LEFT JOIN FETCH h.district " +
      "LEFT JOIN FETCH h.ward " +
      "LEFT JOIN FETCH h.street " +
      "LEFT JOIN FETCH h.photos " +
      "LEFT JOIN FETCH h.amenities a " +
      "LEFT JOIN FETCH a.amenity " +
      "LEFT JOIN FETCH h.reviews r " +
      "LEFT JOIN FETCH r.user " +
      "LEFT JOIN FETCH h.partner " +
      "WHERE h.id = :id";
}
