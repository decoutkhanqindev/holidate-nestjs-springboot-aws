package com.webapp.holidate.constants.db.query.accommodation;

public class RoomQueries {
  public static final String FIND_ALL_BY_HOTEL_ID_WITH_BED_TYPE_PHOTOS_AMENITIES_INVENTORIES_CANCELLATION_POLICY_RESCHEDULE_POLICY = "SELECT DISTINCT r FROM Room r "
      +
      "LEFT JOIN FETCH r.hotel h " +
      "LEFT JOIN FETCH r.bedType bt " +
      "LEFT JOIN FETCH r.photos rph " +
      "LEFT JOIN FETCH rph.photo p " +
      "LEFT JOIN FETCH p.category " +
      "LEFT JOIN FETCH r.amenities ra " +
      "LEFT JOIN FETCH ra.amenity a " +
      "LEFT JOIN FETCH a.category " +
      "LEFT JOIN FETCH r.inventories ri " +
      "LEFT JOIN FETCH r.cancellationPolicy cp " +
      "LEFT JOIN FETCH r.reschedulePolicy rp " +
      "WHERE r.hotel.id = :hotelId";
}