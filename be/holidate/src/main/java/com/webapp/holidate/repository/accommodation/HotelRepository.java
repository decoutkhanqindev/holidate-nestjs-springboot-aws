package com.webapp.holidate.repository.accommodation;

import com.webapp.holidate.constants.db.query.accommodation.HotelQueries;
import com.webapp.holidate.entity.accommodation.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, String> {
  boolean existsByName(String name);

  @Query(HotelQueries.FIND_ALL_WITH_LOCATIONS_PARTNER)
  List<Hotel> findAllWithLocationsAndPartner();
}
