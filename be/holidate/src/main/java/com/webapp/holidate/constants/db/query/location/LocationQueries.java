package com.webapp.holidate.constants.db.query.location;

public class LocationQueries {
  // Find Ward by ID with District, City, Province, and Country
  public static final String FIND_WARD_BY_ID_WITH_DISTRICT_AND_CITY = "SELECT w FROM Ward w " +
      "LEFT JOIN FETCH w.district d " +
      "LEFT JOIN FETCH d.city c " +
      "LEFT JOIN FETCH c.province p " +
      "LEFT JOIN FETCH p.country " +
      "WHERE w.id = :id";

  // Find District by ID with City, Province, and Country
  public static final String FIND_DISTRICT_BY_ID_WITH_CITY_AND_PROVINCE = "SELECT d FROM District d " +
      "LEFT JOIN FETCH d.city c " +
      "LEFT JOIN FETCH c.province p " +
      "LEFT JOIN FETCH p.country " +
      "WHERE d.id = :id";

  // Find City by ID with Province and Country
  public static final String FIND_CITY_BY_ID_WITH_PROVINCE_AND_COUNTRY = "SELECT c FROM City c " +
      "LEFT JOIN FETCH c.province p " +
      "LEFT JOIN FETCH p.country " +
      "WHERE c.id = :id";

  // Find Street by ID with Ward, District, City, Province, and Country
  public static final String FIND_STREET_BY_ID_WITH_WARD_AND_DISTRICT = "SELECT s FROM Street s " +
      "LEFT JOIN FETCH s.ward w " +
      "LEFT JOIN FETCH w.district d " +
      "LEFT JOIN FETCH d.city c " +
      "LEFT JOIN FETCH c.province p " +
      "LEFT JOIN FETCH p.country " +
      "WHERE s.id = :id";
}

