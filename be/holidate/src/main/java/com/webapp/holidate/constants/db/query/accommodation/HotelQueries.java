package com.webapp.holidate.constants.db.query.accommodation;

public class HotelQueries {
    // OPTIMIZED: Database-level aggregation queries for price and availability
    // These queries calculate prices and availability at DB level to avoid loading all inventories
    
    /**
     * Native query to get hotel prices and availability with aggregation
     * Returns: hotel_id, raw_price (min base price), current_price (min inventory price today), available_rooms (sum today)
     */
    public static final String FIND_HOTEL_PRICES_AND_AVAILABILITY_NATIVE = 
            "SELECT " +
            "    h.id as hotelId, " +
            "    COALESCE(MIN(r.base_price_per_night), 0.0) as rawPricePerNight, " +
            "    COALESCE(MIN(CASE WHEN ri.date >= CURRENT_DATE AND ri.available_rooms > 0 THEN ri.price END), MIN(r.base_price_per_night), 0.0) as currentPricePerNight, " +
            "    COALESCE(SUM(CASE WHEN ri.date = CURRENT_DATE THEN ri.available_rooms ELSE 0 END), 0) as availableRooms " +
            "FROM hotels h " +
            "LEFT JOIN rooms r ON r.hotel_id = h.id " +
            "LEFT JOIN room_inventories ri ON ri.room_id = r.id " +
            "WHERE h.id IN :hotelIds " +
            "GROUP BY h.id";

    /**
     * Alternative JPQL query with constructor expression for better type safety
     * Note: JPQL has limitations with CASE expressions, so native query is preferred
     */
    public static final String FIND_HOTEL_PRICES_AND_AVAILABILITY_JPQL =
            "SELECT new com.webapp.holidate.dto.projection.HotelWithPriceProjection(" +
            "    h.id, " +
            "    COALESCE(MIN(r.basePricePerNight), 0.0), " +
            "    COALESCE(MIN(r.basePricePerNight), 0.0), " + // Simplified - will need post-processing
            "    0 " + // Simplified - will need post-processing
            ") " +
            "FROM Hotel h " +
            "LEFT JOIN h.rooms r " +
            "WHERE h.id IN :hotelIds " +
            "GROUP BY h.id";
    

    // Base query with all relationships including collections (for single entity
    // fetch)
    public static final String FIND_WITH_DETAILS_BASE = "SELECT DISTINCT h FROM Hotel h " +
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

    // Base query for pagination - only ManyToOne relationships, no collections
    // This avoids HHH90003004 warning when using pagination with collection fetch
    // OPTIMIZED: Added policy rules to avoid N+1 queries
    public static final String FIND_WITH_BASIC_DETAILS_BASE = "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.country " +
            "LEFT JOIN FETCH h.province " +
            "LEFT JOIN FETCH h.city " +
            "LEFT JOIN FETCH h.district " +
            "LEFT JOIN FETCH h.ward " +
            "LEFT JOIN FETCH h.street " +
            "LEFT JOIN FETCH h.policy pol " +
            "LEFT JOIN FETCH pol.cancellationPolicy cp " +
            "LEFT JOIN FETCH cp.rules " +
            "LEFT JOIN FETCH pol.reschedulePolicy rp " +
            "LEFT JOIN FETCH rp.rules ";

    public static final String FIND_ALL_IDS_BY_FILTER = "SELECT DISTINCT h.id FROM Hotel h " +
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
            "AND (:partnerId IS NULL OR h.partner.id = :partnerId) " +
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

    // Pagination query without collection fetches to avoid HHH90003004 warning
    public static final String FIND_ALL_WITH_FILTERS_PAGED = FIND_WITH_BASIC_DETAILS_BASE +
            "WHERE " +
            "(:name IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:countryId IS NULL OR h.country.id = :countryId) " +
            "AND (:provinceId IS NULL OR h.province.id = :provinceId) " +
            "AND (:cityId IS NULL OR h.city.id = :cityId) " +
            "AND (:districtId IS NULL OR h.district.id = :districtId) " +
            "AND (:wardId IS NULL OR h.ward.id = :wardId) " +
            "AND (:streetId IS NULL OR h.street.id = :streetId) " +
            "AND (:status IS NULL OR h.status = :status) " +
            "AND (:partnerId IS NULL OR h.partner.id = :partnerId) " +
            "AND (:minPrice IS NULL OR EXISTS (" +
            "  SELECT 1 FROM Room r2 JOIN r2.inventories i2 " +
            "  WHERE r2.hotel = h AND i2.price >= :minPrice" +
            ")) " +
            "AND (:maxPrice IS NULL OR EXISTS (" +
            "  SELECT 1 FROM Room r3 JOIN r3.inventories i3 " +
            "  WHERE r3.hotel = h AND i3.price <= :maxPrice" +
            ")) " +
            "AND (:starRating IS NULL OR h.starRating = :starRating) " +
            "AND (:amenityIdsCount = 0 OR h.id IN (" +
            "  SELECT DISTINCT ha.hotel.id FROM HotelAmenity ha " +
            "  WHERE ha.amenity.id IN :amenityIds " +
            "  GROUP BY ha.hotel.id " +
            "  HAVING COUNT(DISTINCT ha.amenity.id) = :amenityIdsCount" +
            "))";

    // DEPRECATED: Causes cartesian product when hotels have many rooms with many inventories
    // Use FIND_ALL_BY_IDS_WITH_ROOMS and fetch inventories separately instead
    @Deprecated
    public static final String FIND_ALL_BY_IDS_WITH_ROOMS_AND_INVENTORIES = "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.rooms r " +
            "LEFT JOIN FETCH r.inventories ri " +
            "WHERE h.id IN :hotelIds";

    // OPTIMIZED: Split rooms and inventories into separate queries to avoid cartesian product
    // Query to fetch hotels with rooms only (no inventories to avoid cartesian product)
    public static final String FIND_ALL_BY_IDS_WITH_ROOMS = "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.rooms r " +
            "WHERE h.id IN :hotelIds";

    // Query to fetch hotels with photos for batch loading after pagination
    public static final String FIND_ALL_BY_IDS_WITH_PHOTOS = "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.photos hp " +
            "LEFT JOIN FETCH hp.photo p " +
            "LEFT JOIN FETCH p.category " +
            "WHERE h.id IN :hotelIds";

    // Optimized query for getById - only fetch basic relationships, no collections
    // Collections (photos, amenities, entertainmentVenues) will be fetched separately to avoid cartesian product
    // OPTIMIZED: Added partner.role, partner.authInfo, and policy documents to avoid N+1 queries
    public static final String FIND_BY_ID_WITH_BASIC_DETAILS = FIND_WITH_BASIC_DETAILS_BASE +
            "LEFT JOIN FETCH h.partner p " +
            "LEFT JOIN FETCH p.role " +
            "LEFT JOIN FETCH p.authInfo " +
            "LEFT JOIN FETCH pol.requiredIdentificationDocuments rid " +
            "LEFT JOIN FETCH rid.identificationDocument " +
            "WHERE h.id = :id";

    // Legacy query - kept for backward compatibility but should be avoided
    // This query causes cartesian product when hotel has many
    // photos/amenities/reviews
    public static final String FIND_BY_ID_WITH_DETAILS = FIND_WITH_DETAILS_BASE +
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

    // Query to fetch hotel with entertainment venues and amenities separately
    public static final String FIND_BY_ID_WITH_ENTERTAINMENT_VENUES_AND_AMENITIES = "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.entertainmentVenues ev " +
            "LEFT JOIN FETCH ev.entertainmentVenue eve " +
            "LEFT JOIN FETCH eve.category " +
            "LEFT JOIN FETCH h.amenities ha " +
            "LEFT JOIN FETCH ha.amenity a " +
            "LEFT JOIN FETCH a.category " +
            "WHERE h.id = :id";

    // Optimized: Split entertainment venues and amenities into separate queries to avoid cartesian product
    public static final String FIND_BY_ID_WITH_ENTERTAINMENT_VENUES = "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.entertainmentVenues ev " +
            "LEFT JOIN FETCH ev.entertainmentVenue eve " +
            "LEFT JOIN FETCH eve.category " +
            "WHERE h.id = :id";

    public static final String FIND_BY_ID_WITH_AMENITIES = "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.amenities ha " +
            "LEFT JOIN FETCH ha.amenity a " +
            "LEFT JOIN FETCH a.category " +
            "WHERE h.id = :id";
}