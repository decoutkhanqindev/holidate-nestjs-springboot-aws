package com.webapp.holidate.repository.accommodation.room;

import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomInventoryRepository extends JpaRepository<RoomInventory, String> {
}
