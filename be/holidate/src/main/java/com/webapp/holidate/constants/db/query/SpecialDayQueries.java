package com.webapp.holidate.constants.db.query;

public class SpecialDayQueries {
  public static final String FIND_ALL_BY_DATE_BETWEEN =
    "SELECT h FROM SpecialDay h " +
      "WHERE h.date >= :startDate " +
      "AND h.date <= :endDate " +
      "ORDER BY h.date ASC";
}