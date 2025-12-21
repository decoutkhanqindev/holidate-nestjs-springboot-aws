package com.webapp.holidate.repository.knowledgebase;

import com.webapp.holidate.constants.db.query.knowledgebase.KnowledgeBaseQueries;
import com.webapp.holidate.dto.knowledgebase.PriceReferenceDto;
import com.webapp.holidate.dto.knowledgebase.ReviewStatsDto;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository interface for Knowledge Base operations.
 * Provides optimized queries to fetch hotel data for knowledge base generation.
 * 
 * Key Optimizations:
 * - Uses LEFT JOIN FETCH to eagerly load relationships and avoid N+1 queries
 * - Separates collection fetches into multiple queries to prevent cartesian product
 * - Uses JPQL Constructor Expression for efficient DTO projections
 * 
 * Usage Pattern:
 * 1. Fetch all active hotels with basic relationships
 * 2. Extract hotel IDs
 * 3. Fetch collections (amenities, venues, rooms) separately using hotel IDs
 * 4. Fetch aggregated data (prices, reviews) using constructor expressions
 */
public interface KnowledgeBaseRepository extends JpaRepository<Hotel, String> {

    /**
     * Find all active hotels with complete location and policy information.
     * This is the main query for Knowledge Base generation.
     * 
     * IMPORTANT: This query does NOT fetch collections (amenities, rooms, reviews, venues)
     * to avoid cartesian product issues. Use separate queries to fetch those.
     * 
     * @param status Hotel status (typically "active" or "ACTIVE")
     * @return List of hotels with eagerly loaded location and policy data
     */
    @Query(KnowledgeBaseQueries.FIND_ALL_ACTIVE_HOTELS_FOR_KNOWLEDGE_BASE)
    List<Hotel> findAllActiveHotelsForKnowledgeBase(@Param("status") String status);

    /**
     * Fetch hotels with their amenities.
     * Should be called after fetching base hotel data to avoid cartesian product.
     * 
     * @param hotelIds List of hotel IDs to fetch amenities for
     * @return List of hotels with eagerly loaded amenities
     */
    @Query(KnowledgeBaseQueries.FIND_HOTELS_WITH_AMENITIES)
    List<Hotel> findHotelsWithAmenities(@Param("hotelIds") List<String> hotelIds);

    /**
     * Fetch hotels with their entertainment venues.
     * Should be called after fetching base hotel data to avoid cartesian product.
     * 
     * @param hotelIds List of hotel IDs to fetch entertainment venues for
     * @return List of hotels with eagerly loaded entertainment venues
     */
    @Query(KnowledgeBaseQueries.FIND_HOTELS_WITH_ENTERTAINMENT_VENUES)
    List<Hotel> findHotelsWithEntertainmentVenues(@Param("hotelIds") List<String> hotelIds);

    /**
     * Fetch all active rooms for given hotels.
     * Should be called after fetching base hotel data to avoid cartesian product.
     * 
     * @param hotelIds List of hotel IDs to fetch rooms for
     * @param activeStatus Room status (typically "active" or "ACTIVE")
     * @return List of rooms with eagerly loaded hotel and bed type
     */
    @Query(KnowledgeBaseQueries.FIND_ROOMS_BY_HOTEL_IDS)
    List<Room> findRoomsByHotelIds(
            @Param("hotelIds") List<String> hotelIds,
            @Param("activeStatus") String activeStatus);

    /**
     * Get price reference (min/max base price) for a specific hotel.
     * Uses JPQL Constructor Expression for efficient projection.
     * Only considers active rooms.
     * Note: Room names need to be retrieved separately due to JPQL limitations.
     * 
     * @param hotelId Hotel ID
     * @param activeStatus Room status (typically "active" or "ACTIVE")
     * @return PriceReferenceDto containing min and max prices (room names empty)
     */
    @Query(KnowledgeBaseQueries.FIND_PRICE_REFERENCE_BY_HOTEL_ID)
    PriceReferenceDto findPriceReferenceByHotelId(
            @Param("hotelId") String hotelId,
            @Param("activeStatus") String activeStatus);
    
    /**
     * Find the name of the room with minimum price for a hotel.
     * 
     * @param hotelId Hotel ID
     * @param activeStatus Room status (typically "active" or "ACTIVE")
     * @return Room name or null if no rooms found
     */
    @Query(KnowledgeBaseQueries.FIND_MIN_PRICE_ROOM_NAME)
    String findMinPriceRoomName(
            @Param("hotelId") String hotelId,
            @Param("activeStatus") String activeStatus);
    
    /**
     * Find the name of the room with maximum price for a hotel.
     * 
     * @param hotelId Hotel ID
     * @param activeStatus Room status (typically "active" or "ACTIVE")
     * @return Room name or null if no rooms found
     */
    @Query(KnowledgeBaseQueries.FIND_MAX_PRICE_ROOM_NAME)
    String findMaxPriceRoomName(
            @Param("hotelId") String hotelId,
            @Param("activeStatus") String activeStatus);

    /**
     * Get review statistics (average score, total reviews) for a specific hotel.
     * Uses JPQL Constructor Expression for efficient aggregation.
     * 
     * @param hotelId Hotel ID
     * @return ReviewStatsDto containing average score and total review count
     */
    @Query(KnowledgeBaseQueries.GET_REVIEW_STATS_BY_HOTEL_ID)
    ReviewStatsDto getReviewStatsByHotelId(@Param("hotelId") String hotelId);

    /**
     * Find hotels modified after a specific timestamp.
     * Uses LEFT JOIN FETCH to eagerly load all relationships (similar to findAllActiveHotelsForKnowledgeBase)
     * to prevent LazyInitializationException during batch processing.
     * 
     * IMPORTANT: This query does NOT fetch collections (amenities, rooms, reviews, venues)
     * to avoid cartesian product issues. Use separate queries to fetch those.
     * 
     * @param status Hotel status (typically "active" or "ACTIVE")
     * @param lastRunTime Timestamp to compare against (hotels updated after this time will be returned)
     * @return List of hotels with eagerly loaded location and policy data
     */
    @Query(KnowledgeBaseQueries.FIND_BY_UPDATED_AT_AFTER)
    List<Hotel> findByUpdatedAtAfter(
            @Param("status") String status,
            @Param("lastRunTime") java.time.LocalDateTime lastRunTime);

    /**
     * Find a single hotel by ID with complete relationships for Knowledge Base generation.
     * Uses LEFT JOIN FETCH to eagerly load all relationships (similar to findAllActiveHotelsForKnowledgeBase)
     * to prevent LazyInitializationException during batch processing.
     * 
     * IMPORTANT: This query does NOT fetch collections (amenities, rooms, reviews, venues)
     * to avoid cartesian product issues. Use separate queries to fetch those.
     * 
     * @param id Hotel ID
     * @return Optional hotel with eagerly loaded location and policy data
     */
    @Query(KnowledgeBaseQueries.FIND_BY_ID_FOR_KNOWLEDGE_BASE)
    java.util.Optional<Hotel> findByIdForKnowledgeBase(@Param("id") String id);

    /**
     * Fetch hotels with their photos.
     * Should be called after fetching base hotel data to avoid cartesian product.
     * 
     * @param hotelIds List of hotel IDs to fetch photos for
     * @return List of hotels with eagerly loaded photos
     */
    @Query(KnowledgeBaseQueries.FIND_HOTELS_WITH_PHOTOS)
    List<Hotel> findHotelsWithPhotos(@Param("hotelIds") List<String> hotelIds);

    /**
     * Fetch rooms with their photos.
     * Should be called after fetching base room data to avoid cartesian product.
     * 
     * @param hotelIds List of hotel IDs to fetch room photos for
     * @param activeStatus Room status (typically "active" or "ACTIVE")
     * @return List of rooms with eagerly loaded photos
     */
    @Query(KnowledgeBaseQueries.FIND_ROOMS_WITH_PHOTOS)
    List<Room> findRoomsWithPhotos(
            @Param("hotelIds") List<String> hotelIds,
            @Param("activeStatus") String activeStatus);
}

