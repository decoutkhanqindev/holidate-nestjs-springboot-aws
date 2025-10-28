package com.webapp.holidate.repository.accommodation.room;

import com.webapp.holidate.constants.db.query.accommodation.room.RoomInventoryQueries;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.accommodation.room.RoomInventoryId;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.Nullable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomInventoryRepository extends JpaRepository<RoomInventory, RoomInventoryId> {
        @Query(RoomInventoryQueries.FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN)
        List<RoomInventory> findAllByRoomIdAndDateBetween(String roomId, LocalDate startDate, LocalDate endDate);

        @Query(RoomInventoryQueries.FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN_WITH_FILTERS)
        List<RoomInventory> findAllByRoomIdAndDateBetweenWithFilters(String roomId, LocalDate startDate,
                        LocalDate endDate,
                        @Nullable String status);

        @Query(RoomInventoryQueries.FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN_PAGED)
        Page<RoomInventory> findAllByRoomIdAndDateBetweenPaged(String roomId, LocalDate startDate, LocalDate endDate,
                        Pageable pageable);

        @Query(RoomInventoryQueries.FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN_WITH_FILTERS_PAGED)
        Page<RoomInventory> findAllByRoomIdAndDateBetweenWithFiltersPaged(String roomId, LocalDate startDate,
                        LocalDate endDate, @Nullable String status, Pageable pageable);

        // Pessimistic locking methods for concurrent booking safety
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT ri FROM RoomInventory ri WHERE ri.id.roomId = :roomId AND ri.id.date BETWEEN :startDate AND :endDate ORDER BY ri.id.date")
        List<RoomInventory> findAllByRoomIdAndDateBetweenWithLock(
                        @Param("roomId") String roomId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT ri FROM RoomInventory ri WHERE ri.id.roomId = :roomId AND ri.id.date = :date")
        Optional<RoomInventory> findByRoomIdAndDateWithLock(
                        @Param("roomId") String roomId,
                        @Param("date") LocalDate date);
}
