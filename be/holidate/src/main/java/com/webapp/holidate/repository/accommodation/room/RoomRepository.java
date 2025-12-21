package com.webapp.holidate.repository.accommodation.room;

import com.webapp.holidate.component.room.RoomCandidate;
import com.webapp.holidate.constants.db.query.DashboardQueries;
import com.webapp.holidate.constants.db.query.accommodation.room.RoomQueries;
import com.webapp.holidate.entity.accommodation.room.Room;
import io.micrometer.common.lang.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, String> {
  boolean existsByNameAndHotelId(String name, String hotelId);

  @Query(RoomQueries.FIND_ALL_BY_HOTEL_ID_WITH_WITH_DETAILS)
  List<Room> findAllByHotelIdWithDetails(String hotelId);

  // Use basic details query for pagination to avoid collection fetch warning
  @Query(RoomQueries.FIND_ALL_BY_HOTEL_ID_WITH_BASIC_DETAILS)
  Page<Room> findAllByHotelIdWithDetailsPaged(String hotelId, Pageable pageable);

  @Query(RoomQueries.FIND_ALL_BY_HOTEL_ID_WITH_FILTERS)
  List<Room> findAllByHotelIdWithFilters(String hotelId, @Nullable String status);

  // Use basic details query for pagination to avoid collection fetch warning
  @Query(RoomQueries.FIND_ALL_BY_HOTEL_ID_WITH_FILTERS_PAGED)
  Page<Room> findAllByHotelIdWithFiltersPaged(String hotelId, @Nullable String status, Pageable pageable);

  @Query(RoomQueries.FIND_BY_ID_WITH_DETAILS)
  Optional<Room> findByIdWithDetails(String id);

  // Optimized query for getById - only fetch basic relationships, no collections
  // Collections (photos, amenities, inventories) will be fetched separately
  // to avoid cartesian product performance issue
  @Query(RoomQueries.FIND_BY_ID_WITH_BASIC_DETAILS)
  Optional<Room> findByIdWithBasicDetails(String id);

  @Query(RoomQueries.FIND_ALL_BY_IDS_WITH_PHOTOS_AND_AMENITIES)
  List<Room> findAllByIdsWithPhotosAndAmenities(List<String> roomIds);

  // OPTIMIZED: Split photos and amenities queries to avoid cartesian product
  @Query(RoomQueries.FIND_ALL_BY_IDS_WITH_PHOTOS)
  List<Room> findAllByIdsWithPhotos(List<String> roomIds);

  @Query(RoomQueries.FIND_ALL_BY_IDS_WITH_AMENITIES)
  List<Room> findAllByIdsWithAmenities(List<String> roomIds);

  // Query to fetch room with inventories separately for batch loading
  @Query(RoomQueries.FIND_BY_ID_WITH_INVENTORIES)
  Optional<Room> findByIdWithInventories(String id);

  // Query to fetch rooms with inventories for batch loading after pagination
  @Query(RoomQueries.FIND_ALL_BY_IDS_WITH_INVENTORIES)
  List<Room> findAllByIdsWithInventories(List<String> roomIds);

  @Query(RoomQueries.FIND_AVAILABLE_ROOM_CANDIDATES)
  List<RoomCandidate> findAvailableRoomCandidates(
    String hotelId,
    LocalDate checkinDate,
    LocalDate checkoutDate,
    long numberOfNights);

  long countByHotelId(String hotelId);
  
  // ============ DASHBOARD QUERIES ============
  
  /**
   * Get room counts grouped by status
   * Returns List of Object[] where [0] = status (String), [1] = count (Long)
   */
  @Query(DashboardQueries.GET_ROOM_STATUS_COUNTS)
  List<Object[]> getRoomStatusCounts(String hotelId);
  
  /**
   * Get total room capacity for a hotel (only active rooms)
   */
  @Query(DashboardQueries.GET_TOTAL_ROOM_CAPACITY)
  long getTotalRoomCapacity(String hotelId, String activeStatus);
}
