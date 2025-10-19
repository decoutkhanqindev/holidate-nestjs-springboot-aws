package com.webapp.holidate.constants.db.query.accommodation.room;

public class RoomInventoryQueries {
  public static final String FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN =
    "SELECT ri FROM RoomInventory ri " +
      "WHERE ri.id.roomId = :roomId " +
      "AND ri.id.date >= :startDate " +
      "AND ri.id.date <= :endDate " +
      "ORDER BY ri.id.date ASC";

  public static final String FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN_WITH_FILTERS =
    "SELECT ri FROM RoomInventory ri " +
      "WHERE ri.id.roomId = :roomId " +
      "AND ri.id.date >= :startDate " +
      "AND ri.id.date <= :endDate " +
      "AND (:status IS NULL OR ri.status = :status) " +
      "ORDER BY ri.id.date ASC";
}