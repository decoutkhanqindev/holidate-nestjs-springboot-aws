package com.webapp.holidate.repository.accommodation.room;

import com.webapp.holidate.component.room.RoomCandidate;
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

  @Query(RoomQueries.FIND_ALL_BY_IDS_WITH_PHOTOS_AND_AMENITIES)
  List<Room> findAllByIdsWithPhotosAndAmenities(List<String> roomIds);

  @Query(RoomQueries.FIND_AVAILABLE_ROOM_CANDIDATES)
  List<RoomCandidate> findAvailableRoomCandidates(
    String hotelId,
    LocalDate checkinDate,
    LocalDate checkoutDate,
    long numberOfNights);

  long countByHotelId(String hotelId);
}
