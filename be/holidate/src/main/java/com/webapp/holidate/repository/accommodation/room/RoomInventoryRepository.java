package com.webapp.holidate.repository.accommodation.room;

import com.webapp.holidate.constants.db.query.accommodation.room.RoomInventoryQueries;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.accommodation.room.RoomInventoryId;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.Nullable;

import java.time.LocalDate;
import java.util.List;

public interface RoomInventoryRepository extends JpaRepository<RoomInventory, RoomInventoryId> {
  @Query(RoomInventoryQueries.FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN)
  List<RoomInventory> findAllByRoomIdAndDateBetween(String roomId, LocalDate startDate, LocalDate endDate);

  @Query(RoomInventoryQueries.FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN_WITH_FILTERS)
  List<RoomInventory> findAllByRoomIdAndDateBetweenWithFilters(String roomId, LocalDate startDate, LocalDate endDate, @Nullable String status);
}
