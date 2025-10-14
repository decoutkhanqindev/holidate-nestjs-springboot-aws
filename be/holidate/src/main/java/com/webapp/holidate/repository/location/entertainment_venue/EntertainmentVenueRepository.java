package com.webapp.holidate.repository.location.entertainment_venue;

import com.webapp.holidate.constants.db.query.accommodation.EntertainmentVenueQueries;
import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EntertainmentVenueRepository extends JpaRepository<EntertainmentVenue, String> {
  @Query(EntertainmentVenueQueries.FIND_ALL_BY_CITY_ID)
  List<EntertainmentVenue> findAllByCityId(String cityId);
}
