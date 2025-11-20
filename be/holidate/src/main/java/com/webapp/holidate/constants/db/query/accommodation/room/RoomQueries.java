package com.webapp.holidate.constants.db.query.accommodation.room;

public class RoomQueries {
    public static final String FIND_AVAILABLE_ROOM_CANDIDATES = """
                SELECT new com.webapp.holidate.component.room.RoomCandidate(
                    r,
                    CAST(MIN(i.availableRooms) AS int),
                    r.basePricePerNight
                )
                FROM Room r JOIN r.inventories i
                WHERE r.hotel.id = :hotelId
                  AND i.id.date >= :checkinDate
                  AND i.id.date < :checkoutDate
                GROUP BY r
                HAVING MIN(i.availableRooms) > 0
                   AND COUNT(i.id.date) = :numberOfNights
            """;
    // Base query with all relationships including collections (for single entity
    // fetch)
    private static final String FIND_WITH_DETAILS_BASE = "SELECT DISTINCT r FROM Room r " +
            "LEFT JOIN FETCH r.bedType bt " +
            "LEFT JOIN FETCH r.photos rph " +
            "LEFT JOIN FETCH rph.photo p " +
            "LEFT JOIN FETCH p.category " +
            "LEFT JOIN FETCH r.amenities ra " +
            "LEFT JOIN FETCH ra.amenity a " +
            "LEFT JOIN FETCH a.category " +
            "LEFT JOIN FETCH r.inventories ri " +
            "LEFT JOIN FETCH r.cancellationPolicy cp " +
            "LEFT JOIN FETCH cp.rules " +
            "LEFT JOIN FETCH r.reschedulePolicy rp " +
            "LEFT JOIN FETCH rp.rules ";

    // Base query for pagination - only ManyToOne relationships, no collections
    // This avoids HHH90003004 warning when using pagination with collection fetch
    private static final String FIND_WITH_BASIC_DETAILS_BASE = "SELECT DISTINCT r FROM Room r " +
            "LEFT JOIN FETCH r.bedType bt " +
            "LEFT JOIN FETCH r.cancellationPolicy cp " +
            "LEFT JOIN FETCH cp.rules " +
            "LEFT JOIN FETCH r.reschedulePolicy rp " +
            "LEFT JOIN FETCH rp.rules ";

    public static final String FIND_ALL_BY_HOTEL_ID_WITH_WITH_DETAILS = FIND_WITH_DETAILS_BASE
            + "WHERE r.hotel.id = :hotelId";

    // Pagination queries without collection fetches
    public static final String FIND_ALL_BY_HOTEL_ID_WITH_BASIC_DETAILS = FIND_WITH_BASIC_DETAILS_BASE
            + "WHERE r.hotel.id = :hotelId";

    public static final String FIND_ALL_BY_HOTEL_ID_WITH_FILTERS = FIND_WITH_DETAILS_BASE +
            "WHERE r.hotel.id = :hotelId " +
            "AND (:status IS NULL OR r.status = :status)";

    public static final String FIND_ALL_BY_HOTEL_ID_WITH_FILTERS_PAGED = FIND_WITH_BASIC_DETAILS_BASE +
            "WHERE r.hotel.id = :hotelId " +
            "AND (:status IS NULL OR r.status = :status)";
    private static final String FIND_WITH_HOTEL_BASE = "SELECT r FROM Room r " +
            "LEFT JOIN FETCH r.hotel h " +
            "LEFT JOIN FETCH h.country " +
            "LEFT JOIN FETCH h.province " +
            "LEFT JOIN FETCH h.city " +
            "LEFT JOIN FETCH h.district " +
            "LEFT JOIN FETCH h.ward " +
            "LEFT JOIN FETCH h.street " +
            "LEFT JOIN FETCH r.bedType bt " +
            "LEFT JOIN FETCH r.photos rph " +
            "LEFT JOIN FETCH rph.photo p " +
            "LEFT JOIN FETCH p.category " +
            "LEFT JOIN FETCH r.amenities ra " +
            "LEFT JOIN FETCH ra.amenity a " +
            "LEFT JOIN FETCH a.category " +
            "LEFT JOIN FETCH r.inventories ri " +
            "LEFT JOIN FETCH r.cancellationPolicy cp " +
            "LEFT JOIN FETCH cp.rules " +
            "LEFT JOIN FETCH r.reschedulePolicy rp " +
            "LEFT JOIN FETCH rp.rules ";
    public static final String FIND_BY_ID_WITH_DETAILS = FIND_WITH_HOTEL_BASE + "WHERE r.id = :id";

    // Query to fetch rooms with photos and amenities for batch loading after
    // pagination
    public static final String FIND_ALL_BY_IDS_WITH_PHOTOS_AND_AMENITIES = "SELECT DISTINCT r FROM Room r " +
            "LEFT JOIN FETCH r.photos rph " +
            "LEFT JOIN FETCH rph.photo p " +
            "LEFT JOIN FETCH p.category " +
            "LEFT JOIN FETCH r.amenities ra " +
            "LEFT JOIN FETCH ra.amenity a " +
            "LEFT JOIN FETCH a.category " +
            "WHERE r.id IN :roomIds";

    // Base query for getById optimization - includes hotel with basic location info
    // but no collections
    // This avoids cartesian product performance issue when room has many
    // photos/amenities/inventories
    private static final String FIND_WITH_HOTEL_BASIC_BASE = "SELECT DISTINCT r FROM Room r " +
            "LEFT JOIN FETCH r.hotel h " +
            "LEFT JOIN FETCH h.country " +
            "LEFT JOIN FETCH h.province " +
            "LEFT JOIN FETCH h.city " +
            "LEFT JOIN FETCH h.district " +
            "LEFT JOIN FETCH h.ward " +
            "LEFT JOIN FETCH h.street " +
            "LEFT JOIN FETCH r.bedType bt " +
            "LEFT JOIN FETCH r.cancellationPolicy cp " +
            "LEFT JOIN FETCH cp.rules " +
            "LEFT JOIN FETCH r.reschedulePolicy rp " +
            "LEFT JOIN FETCH rp.rules ";

    // Optimized query for getById - only fetch basic relationships, no collections
    // Collections (photos, amenities, inventories) will be fetched separately
    // to avoid cartesian product performance issue
    public static final String FIND_BY_ID_WITH_BASIC_DETAILS = FIND_WITH_HOTEL_BASIC_BASE +
            "WHERE r.id = :id";

    // Query to fetch room with inventories separately for batch loading
    public static final String FIND_BY_ID_WITH_INVENTORIES = "SELECT DISTINCT r FROM Room r " +
            "LEFT JOIN FETCH r.inventories ri " +
            "WHERE r.id = :id";

    // Query to fetch rooms with inventories for batch loading after pagination
    public static final String FIND_ALL_BY_IDS_WITH_INVENTORIES = "SELECT DISTINCT r FROM Room r " +
            "LEFT JOIN FETCH r.inventories ri " +
            "WHERE r.id IN :roomIds";
}