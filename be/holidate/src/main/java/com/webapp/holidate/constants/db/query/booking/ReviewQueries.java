package com.webapp.holidate.constants.db.query.booking;

public class ReviewQueries {
  // Base query for finding reviews with all relations
  public static final String FIND_ALL_WITH_DETAILS_BASE = "SELECT DISTINCT r FROM Review r " +
    "LEFT JOIN FETCH r.user u " +
    "LEFT JOIN FETCH u.role " +
    "LEFT JOIN FETCH r.hotel h " +
    "LEFT JOIN FETCH h.country " +
    "LEFT JOIN FETCH h.province " +
    "LEFT JOIN FETCH h.city " +
    "LEFT JOIN FETCH h.district " +
    "LEFT JOIN FETCH h.ward " +
    "LEFT JOIN FETCH h.street " +
    "LEFT JOIN FETCH r.booking b " +
    "LEFT JOIN FETCH r.photos rp " +
    "LEFT JOIN FETCH rp.photo p " +
    "LEFT JOIN FETCH p.category ";

  // Find all reviews with filters and pagination
  public static final String FIND_ALL_WITH_FILTERS_PAGED = FIND_ALL_WITH_DETAILS_BASE +
    "WHERE " +
    "(:hotelId IS NULL OR r.hotel.id = :hotelId) " +
    "AND (:userId IS NULL OR r.user.id = :userId) " +
    "AND (:bookingId IS NULL OR r.booking.id = :bookingId) " +
    "AND (:minScore IS NULL OR r.score >= :minScore) " +
    "AND (:maxScore IS NULL OR r.score <= :maxScore)";

  // Find review by ID with all relations
  public static final String FIND_BY_ID_WITH_DETAILS = FIND_ALL_WITH_DETAILS_BASE +
    "WHERE r.id = :id";
}
