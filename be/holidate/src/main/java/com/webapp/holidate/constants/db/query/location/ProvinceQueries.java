package com.webapp.holidate.constants.db.query.location;

public class ProvinceQueries {
  public static final String FIND_ALL_BY_NAME =
    "SELECT p FROM Province p WHERE p.name LIKE CONCAT('%', :name, '%')";
  public static final String FIND_ALL_BY_COUNTRY_ID =
    "SELECT p FROM Province p WHERE p.country.id = :countryId";
  public static final String FIND_ALL_BY_NAME_AND_COUNTRY_ID =
    "SELECT p FROM Province p WHERE p.name LIKE CONCAT('%', :name, '%') AND p.country.id = :countryId";
}
