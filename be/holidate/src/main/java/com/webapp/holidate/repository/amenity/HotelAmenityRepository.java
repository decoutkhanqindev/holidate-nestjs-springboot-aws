package com.webapp.holidate.repository.amenity;

import com.webapp.holidate.entity.accommodation.amenity.HotelAmenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelAmenityRepository extends JpaRepository<HotelAmenity, String> {
}