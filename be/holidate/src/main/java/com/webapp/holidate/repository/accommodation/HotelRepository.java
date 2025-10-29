package com.webapp.holidate.repository.accommodation;

import com.webapp.holidate.constants.db.query.accommodation.HotelQueries;
import com.webapp.holidate.entity.accommodation.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.Nullable;

import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, String>, JpaSpecificationExecutor<Hotel> {
  boolean existsByName(String name);

  @Query(HotelQueries.FIND_ALL_IDS_BY_FILTER)
  List<String> findAllIdsByFilter(
    @Nullable String name,
    @Nullable String countryId,
    @Nullable String provinceId,
    @Nullable String cityId,
    @Nullable String districtId,
    @Nullable String wardId,
    @Nullable String streetId,
    @Nullable String status,
    @Nullable List<String> amenityIds,
    int amenityIdsCount,
    @Nullable Integer starRating,
    @Nullable Double minPrice,
    @Nullable Double maxPrice);

  @Query(HotelQueries.FIND_ALL_BY_IDS)
  List<Hotel> findAllByIds(List<String> hotelIds);

  @Query(HotelQueries.FIND_ALL_WITH_FILTERS_PAGED)
  Page<Hotel> findAllWithFiltersPaged(
    @Nullable String name,
    @Nullable String countryId,
    @Nullable String provinceId,
    @Nullable String cityId,
    @Nullable String districtId,
    @Nullable String wardId,
    @Nullable String streetId,
    @Nullable String status,
    @Nullable List<String> amenityIds,
    int amenityIdsCount,
    @Nullable Integer starRating,
    @Nullable Double minPrice,
    @Nullable Double maxPrice,
    Pageable pageable);

  @Query(HotelQueries.FIND_ALL_BY_IDS_WITH_ROOMS_AND_INVENTORIES)
  List<Hotel> findAllByIdsWithRoomsAndInventories(List<String> hotelIds);

  @Query(HotelQueries.FIND_WITH_DETAILS_BASE)
  Page<Hotel> findAllWithDetails(Pageable pageable);

  @Query(HotelQueries.FIND_BY_ID_WITH_DETAILS)
  Optional<Hotel> findByIdWithDetails(String id);
}
