package com.webapp.holidate.constants.db.query.location;

public class ProvinceQueries {
  public static final String FIND_ALL_BY_NAME_AND_COUNTRY_ID =
    "SELECT p FROM Province p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) AND p.country.id = :countryId";
}
