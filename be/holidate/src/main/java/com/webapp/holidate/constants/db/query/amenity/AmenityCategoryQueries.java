package com.webapp.holidate.constants.db.query.amenity;

public class AmenityCategoryQueries {
  public static final String FIND_BY_ID_WITH_AMENITIES =
      "SELECT ac FROM AmenityCategory ac LEFT JOIN FETCH ac.amenities WHERE ac.id = :id";
}
