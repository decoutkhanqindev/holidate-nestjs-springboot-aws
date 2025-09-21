package com.webapp.holidate.constants.db.query.location;

public class CountryQueries {
  public static final String FIND_ALL_BY_NAME =
    "SELECT c FROM Country c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))";
}
