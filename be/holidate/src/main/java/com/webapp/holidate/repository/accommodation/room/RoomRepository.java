package com.webapp.holidate.repository.accommodation.room;

import com.webapp.holidate.constants.db.query.accommodation.room.RoomQueries;
import com.webapp.holidate.entity.accommodation.room.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, String> {
  boolean existsByNameAndHotelId(String name, String hotelId);

  @Query(RoomQueries.FIND_ALL_BY_HOTEL_ID_WITH_BED_TYPE_PHOTOS_AMENITIES_INVENTORIES_CANCELLATION_POLICY_RESCHEDULE_POLICY)
  List<Room> findAllByHotelIdWithBedTypePhotosAmenitiesInventoriesCancellationPolicyReschedulePolicy(String hotelId);
}
