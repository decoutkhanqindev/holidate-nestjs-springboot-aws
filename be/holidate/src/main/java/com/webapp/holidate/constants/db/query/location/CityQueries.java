package com.webapp.holidate.constants.db.query.location;

public class CityQueries {
  public static final String FIND_ALL_BY_NAME_AND_PROVINCE_ID =
    "SELECT c FROM City c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')) AND c.province.id = :provinceId";
}
