package com.webapp.holidate.repository.accommodation.room;

import com.webapp.holidate.component.room.RoomCandidate;
import com.webapp.holidate.constants.db.query.accommodation.room.RoomQueries;
import com.webapp.holidate.entity.accommodation.room.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, String> {
  boolean existsByNameAndHotelId(String name, String hotelId);

  @Query(RoomQueries.FIND_ALL_BY_HOTEL_ID_WITH_WITH_DETAILS)
  List<Room> findAllByHotelIdWithDetails(String hotelId);

  @Query(RoomQueries.FIND_BY_ID_WITH_DETAILS)
  Optional<Room> findByIdWithDetails(String id);

  @Query(RoomQueries.FIND_AVAILABLE_ROOM_CANDIDATES)
  List<RoomCandidate> findAvailableRoomCandidates(
    String hotelId,
    LocalDate checkinDate,
    LocalDate checkoutDate,
    long numberOfNights
  );
}
