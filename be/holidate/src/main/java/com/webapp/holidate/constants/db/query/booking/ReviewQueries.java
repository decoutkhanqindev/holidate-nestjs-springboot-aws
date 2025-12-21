package com.webapp.holidate.constants.db.query.booking;

public class ReviewQueries {
  // Base query for finding reviews with all relations including collections (for single entity fetch)
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

  // Base query for pagination - only ManyToOne relationships, no collections
  // This avoids HHH90003004 warning when using pagination with collection fetch
  public static final String FIND_ALL_WITH_BASIC_DETAILS_BASE = "SELECT DISTINCT r FROM Review r " +
    "LEFT JOIN FETCH r.user u " +
    "LEFT JOIN FETCH u.role " +
    "LEFT JOIN FETCH r.hotel h " +
    "LEFT JOIN FETCH h.country " +
    "LEFT JOIN FETCH h.province " +
    "LEFT JOIN FETCH h.city " +
    "LEFT JOIN FETCH h.district " +
    "LEFT JOIN FETCH h.ward " +
    "LEFT JOIN FETCH h.street " +
    "LEFT JOIN FETCH r.booking b ";

  // Find all reviews with filters and pagination (without collection fetch)
  public static final String FIND_ALL_WITH_FILTERS_PAGED = FIND_ALL_WITH_BASIC_DETAILS_BASE +
    "WHERE " +
    "(:hotelId IS NULL OR r.hotel.id = :hotelId) " +
    "AND (:userId IS NULL OR r.user.id = :userId) " +
    "AND (:bookingId IS NULL OR r.booking.id = :bookingId) " +
    "AND (:minScore IS NULL OR r.score >= :minScore) " +
    "AND (:maxScore IS NULL OR r.score <= :maxScore)";

  // Find review by ID with all relations
  public static final String FIND_BY_ID_WITH_DETAILS = FIND_ALL_WITH_DETAILS_BASE +
    "WHERE r.id = :id";

  // Optimized query for getById - only fetch basic relationships, no collections
  // Collections (photos) will be fetched separately to avoid cartesian product performance issue
  public static final String FIND_BY_ID_WITH_BASIC_DETAILS = FIND_ALL_WITH_BASIC_DETAILS_BASE +
    "WHERE r.id = :id";

  // Query to fetch reviews with photos for batch loading after pagination
  public static final String FIND_ALL_BY_IDS_WITH_PHOTOS = "SELECT DISTINCT r FROM Review r " +
    "LEFT JOIN FETCH r.photos rp " +
    "LEFT JOIN FETCH rp.photo p " +
    "LEFT JOIN FETCH p.category " +
    "WHERE r.id IN :reviewIds";

  // Query to fetch review with photos separately for getById
  public static final String FIND_BY_ID_WITH_PHOTOS = "SELECT DISTINCT r FROM Review r " +
    "LEFT JOIN FETCH r.photos rp " +
    "LEFT JOIN FETCH rp.photo p " +
    "LEFT JOIN FETCH p.category " +
    "WHERE r.id = :id";
}
