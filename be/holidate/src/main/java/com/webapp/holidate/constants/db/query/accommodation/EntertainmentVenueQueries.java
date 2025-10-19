package com.webapp.holidate.constants.db.query.accommodation;

public class EntertainmentVenueQueries {
  public static final String FIND_ALL_BY_CITY_ID =
    "SELECT ev FROM EntertainmentVenue ev " +
      "LEFT JOIN FETCH ev.city evc " +
      "LEFT JOIN FETCH ev.category evct " +
      "WHERE ev.city.id = :cityId ";
}
