package com.webapp.holidate.constants.db.query.accommodation;

public class HotelQueries {
  public static final String FIND_ALL_WITH_LOCATIONS_PHOTOS_PARTNER_POLICY =
    "SELECT DISTINCT h FROM Hotel h " +
      "LEFT JOIN FETCH h.country " +
      "LEFT JOIN FETCH h.province " +
      "LEFT JOIN FETCH h.city " +
      "LEFT JOIN FETCH h.district " +
      "LEFT JOIN FETCH h.ward " +
      "LEFT JOIN FETCH h.street " +
      "LEFT JOIN FETCH h.photos hp " +
      "LEFT JOIN FETCH hp.photo p " +
      "LEFT JOIN FETCH p.category " +
      "LEFT JOIN FETCH h.policy pol " +
      "LEFT JOIN FETCH pol.requiredIdentificationDocuments rid " +
      "LEFT JOIN FETCH rid.identificationDocument " +
      "LEFT JOIN FETCH pol.cancellationPolicy " +
      "LEFT JOIN FETCH pol.reschedulePolicy " +
      "LEFT JOIN FETCH h.partner ";

  public static final String FIND_BY_ID_WITH_LOCATIONS_PHOTOS_AMENITIES_REVIEWS_PARTNER_POLICY =
    "SELECT h FROM Hotel h " +
      "LEFT JOIN FETCH h.country " +
      "LEFT JOIN FETCH h.province " +
      "LEFT JOIN FETCH h.city " +
      "LEFT JOIN FETCH h.district " +
      "LEFT JOIN FETCH h.ward " +
      "LEFT JOIN FETCH h.street " +
      "LEFT JOIN FETCH h.photos hp " +
      "LEFT JOIN FETCH hp.photo p " +
      "LEFT JOIN FETCH p.category " +
      "LEFT JOIN FETCH h.amenities ha " +
      "LEFT JOIN FETCH ha.amenity a " +
      "LEFT JOIN FETCH a.category ac " +
      "LEFT JOIN FETCH h.reviews r " +
      "LEFT JOIN FETCH r.user ru " +
      "LEFT JOIN FETCH h.policy pol " +
      "LEFT JOIN FETCH pol.requiredIdentificationDocuments rid " +
      "LEFT JOIN FETCH rid.identificationDocument " +
      "LEFT JOIN FETCH pol.cancellationPolicy cp " +
      "LEFT JOIN FETCH pol.reschedulePolicy rp " +
      "LEFT JOIN FETCH h.partner pt " +
      "WHERE h.id = :id";
}