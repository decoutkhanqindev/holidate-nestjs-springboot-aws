package com.webapp.holidate.constants.db.query.booking.discount;

public class HolidayDiscountQueries {
  public static final String FIND_BY_HOLIDAY_ID_WITH_DISCOUNT =
    "SELECT hd FROM SpecialDayDiscount hd " +
    "JOIN FETCH hd.discount d " +
    "WHERE hd.specialDay.id = :holidayId";
}
