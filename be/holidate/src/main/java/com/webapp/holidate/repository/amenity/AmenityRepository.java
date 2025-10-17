package com.webapp.holidate.repository.amenity;

import com.webapp.holidate.constants.db.query.AmenityQueries;
import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AmenityRepository extends JpaRepository<Amenity, String> {
  boolean existsByName(String name);

  @Query(AmenityQueries.FIND_ALL_WITH_CATEGORY)
  List<Amenity> findAllWithCategory();

  @Query(AmenityQueries.FIND_ALL_WITH_CATEGORY_BY_CATEGORY_ID)
  List<Amenity> findAllByCategoryId(String categoryId);
}
