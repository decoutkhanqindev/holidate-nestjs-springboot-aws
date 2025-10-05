package com.webapp.holidate.repository.accommodation.room;

import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.accommodation.room.RoomInventoryId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RoomInventoryRepository extends JpaRepository<RoomInventory, RoomInventoryId> {
}
