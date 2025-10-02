package com.webapp.holidate.repository.amenity;

import com.webapp.holidate.entity.accommodation.amenity.RoomAmenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomAmenityRepository extends JpaRepository<RoomAmenity, String> {
}