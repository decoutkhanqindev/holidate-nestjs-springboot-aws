package com.webapp.holidate.constants.db.query.accommodation;

public class HotelQueries {
  public static final String FIND_WITH_DETAILS_BASE =
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

  public static final String FIND_ALL_IDS_BY_FILTER =
    "SELECT DISTINCT h.id FROM Hotel h " +
      "LEFT JOIN h.amenities ha " +
      "WHERE " +
      "(:name IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
      "AND (:countryId IS NULL OR h.country.id = :countryId) " +
      "AND (:provinceId IS NULL OR h.province.id = :provinceId) " +
      "AND (:cityId IS NULL OR h.city.id = :cityId) " +
      "AND (:districtId IS NULL OR h.district.id = :districtId) " +
      "AND (:wardId IS NULL OR h.ward.id = :wardId) " +
      "AND (:streetId IS NULL OR h.street.id = :streetId) " +
      "AND (:status IS NULL OR h.status = :status) " +
      "AND (:minPrice IS NULL OR EXISTS (" +
      "  SELECT 1 FROM Room r2 JOIN r2.inventories i2 " +
      "  WHERE r2.hotel = h AND i2.price >= :minPrice" +
      ")) " +
      "AND (:maxPrice IS NULL OR EXISTS (" +
      "  SELECT 1 FROM Room r3 JOIN r3.inventories i3 " +
      "  WHERE r3.hotel = h AND i3.price <= :maxPrice" +
      ")) " +
      "AND (:starRating IS NULL OR h.starRating = :starRating) " +
      "AND (:amenityIdsCount = 0 OR ha.amenity.id IN :amenityIds) " +
      "GROUP BY h.id " +
      "HAVING (:amenityIdsCount = 0 OR COUNT(DISTINCT ha.amenity.id) = :amenityIdsCount)";

  public static final String FIND_ALL_BY_IDS = FIND_WITH_DETAILS_BASE + "WHERE h.id IN :hotelIds";

  public static final String FIND_ALL_BY_IDS_WITH_ROOMS_AND_INVENTORIES =
    "SELECT DISTINCT h FROM Hotel h " +
      "LEFT JOIN FETCH h.rooms r " +
      "LEFT JOIN FETCH r.inventories ri " +
      "WHERE h.id IN :hotelIds";

  public static final String FIND_BY_ID_WITH_DETAILS =
    FIND_WITH_DETAILS_BASE +
      "LEFT JOIN FETCH h.entertainmentVenues ev " +
      "LEFT JOIN FETCH ev.entertainmentVenue eve " +
      "LEFT JOIN FETCH eve.category " +
      "LEFT JOIN FETCH h.amenities ha " +
      "LEFT JOIN FETCH ha.amenity a " +
      "LEFT JOIN FETCH a.category " +
      "LEFT JOIN FETCH h.reviews hr " +
      "LEFT JOIN FETCH hr.user " +
      "LEFT JOIN FETCH h.partner " +
      "WHERE h.id = :id";
}