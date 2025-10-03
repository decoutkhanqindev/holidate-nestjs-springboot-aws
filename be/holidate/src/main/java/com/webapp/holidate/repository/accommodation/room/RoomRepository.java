package com.webapp.holidate.repository.accommodation.room;

import com.webapp.holidate.entity.accommodation.room.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, String> {
}
