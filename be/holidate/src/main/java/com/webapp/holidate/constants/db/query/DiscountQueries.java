package com.webapp.holidate.constants.db.query;

public class DiscountQueries {
  public static final String FIND_BY_SPECIAL_DAY_ID_WITH_DISCOUNT =
    "SELECT hd FROM SpecialDayDiscount hd " +
    "JOIN FETCH hd.discount d " +
    "WHERE hd.specialDay.id = :specialDayId";
}
