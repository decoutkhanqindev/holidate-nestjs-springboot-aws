package com.webapp.holidate.constants.db.query.accommodation;

public class HotelQueries {
  private static final String FIND_ALL_BASE =
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
      "LEFT JOIN FETCH pol.reschedulePolicy ";

  public static final String FIND_ALL_WITH_LOCATIONS_PHOTOS_POLICY =
    FIND_ALL_BASE +
      "LEFT JOIN FETCH h.rooms r " +
      "LEFT JOIN FETCH r.inventories i";

  public static final String FIND_ALL_BY_FILTER_WITH_LOCATIONS_PHOTOS_POLICY =
    FIND_ALL_BASE +
      "LEFT JOIN h.amenities ha " +
      "LEFT JOIN FETCH h.rooms r " +
      "LEFT JOIN FETCH r.inventories i " +
      "WHERE i.id.date = :currentDate " +
      // location filters
      "AND (:countryId IS NULL OR h.country.id = :countryId) " +
      "AND (:provinceId IS NULL OR h.province.id = :provinceId) " +
      "AND (:cityId IS NULL OR h.city.id = :cityId) " +
      "AND (:districtId IS NULL OR h.district.id = :districtId) " +
      "AND (:wardId IS NULL OR h.ward.id = :wardId) " +
      "AND (:streetId IS NULL OR h.street.id = :streetId) " +
      // room & inventory filters
      "AND (:maxAdults IS NULL OR r.maxAdults >= :maxAdults) " +
      "AND (:maxChildren IS NULL OR r.maxChildren >= :maxChildren) " +
      "AND (:maxRooms IS NULL OR i.availableRooms >= :maxRooms) " +
      "AND (:minPrice IS NULL OR i.price >= :minPrice) " +
      "AND (:maxPrice IS NULL OR i.price <= :maxPrice) " +
      // amenity filters
      "AND (:amenityIds IS NULL OR ha.amenity.id IN :amenityIds) " +
      "GROUP BY h.id " +
      "HAVING (:amenityIds IS NULL OR COUNT(DISTINCT ha.amenity.id) = :amenityIdsCount)";

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