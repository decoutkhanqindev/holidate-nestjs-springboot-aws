package com.webapp.holidate.constants.db.query.accommodation.room;

public class RoomQueries {
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
    "LEFT JOIN FETCH r.reschedulePolicy rp ";

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
    "LEFT JOIN FETCH r.reschedulePolicy rp ";

  public static final String FIND_ALL_BY_HOTEL_ID_WITH_WITH_DETAILS = FIND_WITH_DETAILS_BASE
    + "WHERE r.hotel.id = :hotelId";

  public static final String FIND_ALL_BY_HOTEL_ID_WITH_FILTERS = FIND_WITH_DETAILS_BASE +
    "WHERE r.hotel.id = :hotelId " +
    "AND (:status IS NULL OR r.status = :status)";

  public static final String FIND_BY_ID_WITH_DETAILS = FIND_WITH_HOTEL_BASE + "WHERE r.id = :id";

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
}