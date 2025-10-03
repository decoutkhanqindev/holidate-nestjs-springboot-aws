package com.webapp.holidate.constants.db.query.accommodation;

public class RoomQueries {
  public static final String FIND_ALL_WITH_HOTEL_PHOTOS_AMENITIES_INVENTORIES_CANCELLATION_POLICY =
    "SELECT DISTINCT r FROM Room r " +
      "LEFT JOIN FETCH r.hotel h " +
      "LEFT JOIN FETCH h.photos hp " +
      "LEFT JOIN FETCH hp.photo p " +
      "LEFT JOIN FETCH p.category " +
      "LEFT JOIN FETCH h.amenities ha " +
      "LEFT JOIN FETCH ha.amenity a " +
      "LEFT JOIN FETCH a.category " +
      "LEFT JOIN FETCH r.inventories ri " +
      "LEFT JOIN FETCH r.cancellationPolicy cp";
}
