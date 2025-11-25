package com.webapp.holidate.constants.db.query.knowledgebase;

/**
 * Query constants for Knowledge Base Repository.
 * Contains optimized JPQL queries for fetching hotel data for knowledge base generation.
 * All queries use LEFT JOIN FETCH to avoid N+1 query problems.
 */
public class KnowledgeBaseQueries {

    /**
     * Optimized query to fetch all active hotels with complete relationships for Knowledge Base.
     * Uses LEFT JOIN FETCH to eagerly load all required data in a single query.
     * This query fetches:
     * - Hotel basic info
     * - Location hierarchy (country, province, city, district, ward, street)
     * - Hotel policy with cancellation and reschedule policies
     * - Required identification documents
     * 
     * Note: Collections (rooms, amenities, entertainment venues, reviews) are NOT fetched here
     * to avoid cartesian product. They should be fetched separately using hotel IDs.
     */
    public static final String FIND_ALL_ACTIVE_HOTELS_FOR_KNOWLEDGE_BASE =
            "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.country co " +
            "LEFT JOIN FETCH h.province pr " +
            "LEFT JOIN FETCH h.city ci " +
            "LEFT JOIN FETCH h.district di " +
            "LEFT JOIN FETCH h.ward wa " +
            "LEFT JOIN FETCH h.street st " +
            "LEFT JOIN FETCH h.policy pol " +
            "LEFT JOIN FETCH pol.cancellationPolicy cp " +
            "LEFT JOIN FETCH pol.reschedulePolicy rp " +
            "LEFT JOIN FETCH pol.requiredIdentificationDocuments rid " +
            "LEFT JOIN FETCH rid.identificationDocument " +
            "WHERE h.status = :status " +
            "ORDER BY h.name ASC";

    /**
     * Query to fetch hotels with their amenities.
     * Separated from main query to avoid cartesian product.
     */
    public static final String FIND_HOTELS_WITH_AMENITIES =
            "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.amenities ha " +
            "LEFT JOIN FETCH ha.amenity a " +
            "LEFT JOIN FETCH a.category " +
            "WHERE h.id IN :hotelIds";

    /**
     * Query to fetch hotels with their entertainment venues.
     * Separated from main query to avoid cartesian product.
     */
    public static final String FIND_HOTELS_WITH_ENTERTAINMENT_VENUES =
            "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.entertainmentVenues hev " +
            "LEFT JOIN FETCH hev.entertainmentVenue ev " +
            "LEFT JOIN FETCH ev.category " +
            "WHERE h.id IN :hotelIds";

    /**
     * Query to fetch rooms for specific hotels.
     * Separated from main query to avoid cartesian product.
     */
    public static final String FIND_ROOMS_BY_HOTEL_IDS =
            "SELECT DISTINCT r FROM Room r " +
            "LEFT JOIN FETCH r.hotel h " +
            "LEFT JOIN FETCH r.bedType bt " +
            "WHERE r.hotel.id IN :hotelIds " +
            "AND r.status = :activeStatus " +
            "ORDER BY r.hotel.id, r.name ASC";

    /**
     * Query to get price reference (min/max) with room names for a specific hotel.
     * Note: JPQL has limitations with subqueries in constructor expressions,
     * so this query only gets min/max prices. Room names are retrieved separately.
     */
    public static final String FIND_PRICE_REFERENCE_BY_HOTEL_ID =
            "SELECT new com.webapp.holidate.dto.knowledgebase.PriceReferenceDto(" +
            "    COALESCE(MIN(r.basePricePerNight), 0.0), " +
            "    '', " +  // minPriceRoomName - will be filled by service
            "    COALESCE(MAX(r.basePricePerNight), 0.0), " +
            "    '' " +   // maxPriceRoomName - will be filled by service
            ") " +
            "FROM Room r " +
            "WHERE r.hotel.id = :hotelId " +
            "AND r.status = :activeStatus";
    
    /**
     * Query to find room name with minimum price for a hotel.
     */
    public static final String FIND_MIN_PRICE_ROOM_NAME =
            "SELECT r.name FROM Room r " +
            "WHERE r.hotel.id = :hotelId " +
            "AND r.status = :activeStatus " +
            "AND r.basePricePerNight = (" +
            "    SELECT MIN(r2.basePricePerNight) FROM Room r2 " +
            "    WHERE r2.hotel.id = :hotelId AND r2.status = :activeStatus" +
            ")";
    
    /**
     * Query to find room name with maximum price for a hotel.
     */
    public static final String FIND_MAX_PRICE_ROOM_NAME =
            "SELECT r.name FROM Room r " +
            "WHERE r.hotel.id = :hotelId " +
            "AND r.status = :activeStatus " +
            "AND r.basePricePerNight = (" +
            "    SELECT MAX(r2.basePricePerNight) FROM Room r2 " +
            "    WHERE r2.hotel.id = :hotelId AND r2.status = :activeStatus" +
            ")";

    /**
     * Query to get review statistics (average score, total reviews) for a specific hotel.
     * Uses Constructor Expression to map directly to ReviewStatsDto.
     */
    public static final String GET_REVIEW_STATS_BY_HOTEL_ID =
            "SELECT new com.webapp.holidate.dto.knowledgebase.ReviewStatsDto(" +
            "    COALESCE(AVG(CAST(r.score AS double)), 0.0), " +
            "    COUNT(r) " +
            ") " +
            "FROM Review r " +
            "WHERE r.hotel.id = :hotelId";

    /**
     * Query to find hotels modified after a specific timestamp.
     * Uses LEFT JOIN FETCH to eagerly load all relationships (similar to findAllActiveHotelsForKnowledgeBase)
     * to prevent LazyInitializationException during batch processing.
     * 
     * This query fetches:
     * - Hotel basic info
     * - Location hierarchy (country, province, city, district, ward, street)
     * - Hotel policy with cancellation and reschedule policies
     * - Required identification documents
     * 
     * Note: Collections (rooms, amenities, entertainment venues) are NOT fetched here
     * to avoid cartesian product. They should be fetched separately using hotel IDs.
     */
    public static final String FIND_BY_UPDATED_AT_AFTER =
            "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.country co " +
            "LEFT JOIN FETCH h.province pr " +
            "LEFT JOIN FETCH h.city ci " +
            "LEFT JOIN FETCH h.district di " +
            "LEFT JOIN FETCH h.ward wa " +
            "LEFT JOIN FETCH h.street st " +
            "LEFT JOIN FETCH h.policy pol " +
            "LEFT JOIN FETCH pol.cancellationPolicy cp " +
            "LEFT JOIN FETCH pol.reschedulePolicy rp " +
            "LEFT JOIN FETCH pol.requiredIdentificationDocuments rid " +
            "LEFT JOIN FETCH rid.identificationDocument " +
            "WHERE h.status = :status " +
            "AND h.updatedAt IS NOT NULL " +
            "AND h.updatedAt > :lastRunTime " +
            "ORDER BY h.name ASC";

    /**
     * Query to find a single hotel by ID with complete relationships for Knowledge Base generation.
     * Uses LEFT JOIN FETCH to eagerly load all relationships (similar to findAllActiveHotelsForKnowledgeBase)
     * to prevent LazyInitializationException during batch processing.
     * 
     * This query fetches:
     * - Hotel basic info
     * - Location hierarchy (country, province, city, district, ward, street)
     * - Hotel policy with cancellation and reschedule policies
     * - Required identification documents
     * 
     * Note: Collections (rooms, amenities, entertainment venues) are NOT fetched here
     * to avoid cartesian product. They should be fetched separately using hotel IDs.
     */
    public static final String FIND_BY_ID_FOR_KNOWLEDGE_BASE =
            "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.country co " +
            "LEFT JOIN FETCH h.province pr " +
            "LEFT JOIN FETCH h.city ci " +
            "LEFT JOIN FETCH h.district di " +
            "LEFT JOIN FETCH h.ward wa " +
            "LEFT JOIN FETCH h.street st " +
            "LEFT JOIN FETCH h.policy pol " +
            "LEFT JOIN FETCH pol.cancellationPolicy cp " +
            "LEFT JOIN FETCH pol.reschedulePolicy rp " +
            "LEFT JOIN FETCH pol.requiredIdentificationDocuments rid " +
            "LEFT JOIN FETCH rid.identificationDocument " +
            "WHERE h.id = :id";

    /**
     * Query to fetch hotels with their photos.
     * Separated from main query to avoid cartesian product.
     * Fetches HotelPhoto -> Photo relationships.
     */
    public static final String FIND_HOTELS_WITH_PHOTOS =
            "SELECT DISTINCT h FROM Hotel h " +
            "LEFT JOIN FETCH h.photos hp " +
            "LEFT JOIN FETCH hp.photo p " +
            "WHERE h.id IN :hotelIds";

    /**
     * Query to fetch rooms with their photos.
     * Separated from main query to avoid cartesian product.
     * Fetches RoomPhoto -> Photo relationships.
     */
    public static final String FIND_ROOMS_WITH_PHOTOS =
            "SELECT DISTINCT r FROM Room r " +
            "LEFT JOIN FETCH r.photos rp " +
            "LEFT JOIN FETCH rp.photo p " +
            "WHERE r.hotel.id IN :hotelIds " +
            "AND r.status = :activeStatus";
}

