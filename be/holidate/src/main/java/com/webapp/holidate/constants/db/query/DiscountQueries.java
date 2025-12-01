package com.webapp.holidate.constants.db.query;

public class DiscountQueries {
  public static final String FIND_BY_SPECIAL_DAY_ID_WITH_DISCOUNT = "SELECT DISTINCT hd FROM SpecialDayDiscount hd "
    +
    "JOIN FETCH hd.discount d " +
    "WHERE hd.specialDay.id = :specialDayId";

  public static final String FIND_ALL_WITH_FILTERS = "SELECT DISTINCT d FROM Discount d " +
    "WHERE " +
    "(:code IS NULL OR LOWER(d.code) LIKE LOWER(CONCAT('%', :code, '%'))) " +
    "AND (:active IS NULL OR d.active = :active) " +
    "AND (:currentlyValid IS NULL OR " +
    "  (:currentlyValid = true AND d.validFrom <= CURRENT_DATE AND d.validTo >= CURRENT_DATE) OR " +
    "  (:currentlyValid = false AND (d.validFrom > CURRENT_DATE OR d.validTo < CURRENT_DATE))) " +
    "AND (:validFrom IS NULL OR d.validFrom >= :validFrom) " +
    "AND (:validTo IS NULL OR d.validTo <= :validTo) " +
    "AND (:minPercentage IS NULL OR d.percentage >= :minPercentage) " +
    "AND (:maxPercentage IS NULL OR d.percentage <= :maxPercentage) " +
    "AND (:minBookingPrice IS NULL OR d.minBookingPrice >= :minBookingPrice) " +
    "AND (:maxBookingPrice IS NULL OR d.minBookingPrice <= :maxBookingPrice) " +
    "AND (:minBookingCount IS NULL OR d.minBookingCount >= :minBookingCount) " +
    "AND (:maxBookingCount IS NULL OR d.minBookingCount <= :maxBookingCount) " +
    "AND (:available IS NULL OR " +
    "  (:available = true AND d.timesUsed < d.usageLimit) OR " +
    "  (:available = false AND d.timesUsed >= d.usageLimit)) " +
    "AND (:exhausted IS NULL OR " +
    "  (:exhausted = true AND d.timesUsed >= d.usageLimit) OR " +
    "  (:exhausted = false AND d.timesUsed < d.usageLimit)) " +
    "AND (:minTimesUsed IS NULL OR d.timesUsed >= :minTimesUsed) " +
    "AND (:maxTimesUsed IS NULL OR d.timesUsed <= :maxTimesUsed) " +
    "AND (:hotelId IS NULL OR EXISTS (" +
    "  SELECT 1 FROM HotelDiscount hd WHERE hd.discount = d AND hd.hotel.id = :hotelId)) " +
    "AND (:specialDayId IS NULL OR EXISTS (" +
    "  SELECT 1 FROM SpecialDayDiscount sdd WHERE sdd.discount = d AND sdd.specialDay.id = :specialDayId))";

  public static final String FIND_BY_ID_WITH_DETAILS = "SELECT DISTINCT d FROM Discount d " +
    "WHERE d.id = :id";

  public static final String FIND_BY_DISCOUNT_ID_WITH_HOTEL = "SELECT DISTINCT hd FROM HotelDiscount hd " +
    "LEFT JOIN FETCH hd.hotel h " +
    "LEFT JOIN FETCH h.country " +
    "LEFT JOIN FETCH h.province " +
    "LEFT JOIN FETCH h.city " +
    "LEFT JOIN FETCH h.district " +
    "LEFT JOIN FETCH h.ward " +
    "LEFT JOIN FETCH h.street " +
    "WHERE hd.discount.id = :discountId";

  public static final String FIND_BY_DISCOUNT_ID_WITH_SPECIAL_DAY = "SELECT DISTINCT sdd FROM SpecialDayDiscount sdd "
    +
    "WHERE sdd.discount.id = :discountId";
  
  public static final String FIND_ALL_BY_HOTEL_ID_WITH_DISCOUNT = "SELECT DISTINCT hd FROM HotelDiscount hd " +
    "LEFT JOIN FETCH hd.discount d " +
    "WHERE hd.hotel.id = :hotelId";
}
