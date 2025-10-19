package com.webapp.holidate.constants.db.query;

public class AmenityQueries {
  public static final String FIND_ALL_WITH_CATEGORY =
    "SELECT a FROM Amenity a " +
    "LEFT JOIN FETCH a.category ";

  public static final String FIND_ALL_WITH_CATEGORY_BY_CATEGORY_ID =
    FIND_ALL_WITH_CATEGORY + "WHERE a.category.id = :categoryId ";
}
