package com.webapp.holidate.constants.db.query.booking;

public class BookingQueries {

    // Find booking by ID with all related entities loaded
    public static final String FIND_BY_ID_WITH_ALL_RELATIONS = "SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.user u " +
            "LEFT JOIN FETCH u.role " +
            "LEFT JOIN FETCH b.room r " +
            "LEFT JOIN FETCH r.bedType " +
            "LEFT JOIN FETCH r.inventories " +
            "LEFT JOIN FETCH r.cancellationPolicy cp " +
            "LEFT JOIN FETCH cp.rules " +
            "LEFT JOIN FETCH r.reschedulePolicy rp " +
            "LEFT JOIN FETCH rp.rules " +
            "LEFT JOIN FETCH r.hotel rh " +
            "LEFT JOIN FETCH rh.country " +
            "LEFT JOIN FETCH rh.province " +
            "LEFT JOIN FETCH rh.city " +
            "LEFT JOIN FETCH rh.district " +
            "LEFT JOIN FETCH rh.ward " +
            "LEFT JOIN FETCH rh.street " +
            "LEFT JOIN FETCH b.hotel h " +
            "LEFT JOIN FETCH h.country " +
            "LEFT JOIN FETCH h.province " +
            "LEFT JOIN FETCH h.city " +
            "LEFT JOIN FETCH h.district " +
            "LEFT JOIN FETCH h.ward " +
            "LEFT JOIN FETCH h.street " +
            "LEFT JOIN FETCH b.appliedDiscount " +
            "WHERE b.id = :id";

    // Find booking by ID with room relation loaded
    public static final String FIND_BY_ID_WITH_ROOM = "SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.room " +
            "WHERE b.id = :id";

    // Find expired bookings by status and creation time
    public static final String FIND_BY_STATUS_AND_CREATED_AT_BEFORE = "SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.room " +
            "WHERE b.status = :status AND b.createdAt < :createdAt";

    // Count bookings by user ID and status list
    public static final String COUNT_BY_USER_ID_AND_STATUS_IN = "SELECT COUNT(b) FROM Booking b " +
            "WHERE b.user.id = :userId AND b.status IN :statuses";
}
