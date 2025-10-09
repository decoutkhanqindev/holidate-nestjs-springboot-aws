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

  public static final String FIND_IDS_BY_FILTER =
    "SELECT DISTINCT h.id FROM Hotel h " +
      "LEFT JOIN h.amenities ha " +
      "WHERE " +
      "(:countryId IS NULL OR h.country.id = :countryId) " +
      "AND (:provinceId IS NULL OR h.province.id = :provinceId) " +
      "AND (:cityId IS NULL OR h.city.id = :cityId) " +
      "AND (:districtId IS NULL OR h.district.id = :districtId) " +
      "AND (:wardId IS NULL OR h.ward.id = :wardId) " +
      "AND (:streetId IS NULL OR h.street.id = :streetId) " +
      "AND (:minPrice IS NULL OR EXISTS (" +
      "  SELECT 1 FROM Room r2 JOIN r2.inventories i2 " +
      "  WHERE r2.hotel = h AND i2.price >= :minPrice" +
      ")) " +
      "AND (:maxPrice IS NULL OR EXISTS (" +
      "  SELECT 1 FROM Room r3 JOIN r3.inventories i3 " +
      "  WHERE r3.hotel = h AND i3.price <= :maxPrice" +
      ")) " +
      "AND (:amenityIdsCount = 0 OR ha.amenity.id IN :amenityIds) " +
      "GROUP BY h.id " +
      "HAVING (:amenityIdsCount = 0 OR COUNT(DISTINCT ha.amenity.id) = :amenityIdsCount)";

  public static final String FIND_ALL_BY_IDS_WITH_LOCATIONS_PHOTOS_POLICY =
    FIND_ALL_BASE +
      "LEFT JOIN FETCH h.rooms r " +
      "LEFT JOIN FETCH r.inventories i " +
      "WHERE h.id IN :hotelIds";

//  public static final String FIND_ALL_BY_FILTER_WITH_LOCATIONS_PHOTOS_POLICY =
//    FIND_ALL_BASE +
//      "LEFT JOIN h.amenities ha " +
//      "LEFT JOIN FETCH h.rooms r " +
//      "LEFT JOIN FETCH r.inventories i " +
//      "WHERE " +
//      "(:countryId IS NULL OR h.country.id = :countryId) " +
//      "AND (:provinceId IS NULL OR h.province.id = :provinceId) " +
//      "AND (:cityId IS NULL OR h.city.id = :cityId) " +
//      "AND (:districtId IS NULL OR h.district.id = :districtId) " +
//      "AND (:wardId IS NULL OR h.ward.id = :wardId) " +
//      "AND (:streetId IS NULL OR h.street.id = :streetId) " +
//      "AND (:amenityIdsCount = 0 OR ha.amenity.id IN :amenityIds) " +
//      "GROUP BY h.id " +
//      "HAVING (:amenityIdsCount = 0 OR COUNT(DISTINCT ha.amenity.id) = :amenityIdsCount)";

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