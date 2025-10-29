package com.webapp.holidate.constants.db.query.accommodation.room;

public class RoomInventoryQueries {
  public static final String FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN = "SELECT ri FROM RoomInventory ri " +
    "WHERE ri.id.roomId = :roomId " +
    "AND ri.id.date >= :startDate " +
    "AND ri.id.date <= :endDate " +
    "ORDER BY ri.id.date ASC";

  public static final String FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN_WITH_FILTERS = "SELECT ri FROM RoomInventory ri " +
    "WHERE ri.id.roomId = :roomId " +
    "AND ri.id.date >= :startDate " +
    "AND ri.id.date <= :endDate " +
    "AND (:status IS NULL OR ri.status = :status) " +
    "ORDER BY ri.id.date ASC";

  // Paginated queries for database-level pagination
  public static final String FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN_PAGED = "SELECT ri FROM RoomInventory ri " +
    "WHERE ri.id.roomId = :roomId " +
    "AND ri.id.date >= :startDate " +
    "AND ri.id.date <= :endDate";

  public static final String FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN_WITH_FILTERS_PAGED = "SELECT ri FROM RoomInventory ri " +
    "WHERE ri.id.roomId = :roomId " +
    "AND ri.id.date >= :startDate " +
    "AND ri.id.date <= :endDate " +
    "AND (:status IS NULL OR ri.status = :status)";

  public static final String FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN_WITH_LOCK = "SELECT ri FROM RoomInventory ri " +
    "WHERE ri.id.roomId = :roomId " +
    "AND ri.id.date >= :startDate " +
    "AND ri.id.date <= :endDate " +
    "ORDER BY ri.id.date ASC";
}