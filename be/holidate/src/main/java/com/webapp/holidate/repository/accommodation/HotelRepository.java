package com.webapp.holidate.repository.accommodation;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.Nullable;

import com.webapp.holidate.constants.db.query.DashboardQueries;
import com.webapp.holidate.constants.db.query.accommodation.HotelQueries;
import com.webapp.holidate.entity.accommodation.Hotel;

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
      @Nullable String partnerId,
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
      @Nullable String partnerId,
      @Nullable List<String> amenityIds,
      int amenityIdsCount,
      @Nullable Integer starRating,
      @Nullable Double minPrice,
      @Nullable Double maxPrice,
      Pageable pageable);

  // DEPRECATED: Causes cartesian product - use findAllByIdsWithRooms and fetch inventories separately
  @Deprecated
  @Query(HotelQueries.FIND_ALL_BY_IDS_WITH_ROOMS_AND_INVENTORIES)
  List<Hotel> findAllByIdsWithRoomsAndInventories(List<String> hotelIds);

  // OPTIMIZED: Fetch rooms only (no inventories) to avoid cartesian product
  @Query(HotelQueries.FIND_ALL_BY_IDS_WITH_ROOMS)
  List<Hotel> findAllByIdsWithRooms(List<String> hotelIds);

  @Query(HotelQueries.FIND_ALL_BY_IDS_WITH_PHOTOS)
  List<Hotel> findAllByIdsWithPhotos(List<String> hotelIds);

  // Use basic details query for pagination to avoid collection fetch warning
  @Query(HotelQueries.FIND_WITH_BASIC_DETAILS_BASE)
  Page<Hotel> findAllWithDetails(Pageable pageable);

  @Query(HotelQueries.FIND_BY_ID_WITH_BASIC_DETAILS)
  Optional<Hotel> findByIdWithBasicDetails(String id);

  @Query(HotelQueries.FIND_BY_ID_WITH_DETAILS)
  Optional<Hotel> findByIdWithDetails(String id);

  @Query(HotelQueries.FIND_BY_ID_WITH_ENTERTAINMENT_VENUES_AND_AMENITIES)
  Optional<Hotel> findByIdWithEntertainmentVenuesAndAmenities(String id);

  @Query(HotelQueries.FIND_BY_ID_WITH_ENTERTAINMENT_VENUES)
  Optional<Hotel> findByIdWithEntertainmentVenues(String id);

  @Query(HotelQueries.FIND_BY_ID_WITH_AMENITIES)
  Optional<Hotel> findByIdWithAmenities(String id);

  long countByCountryId(String countryId);

  long countByProvinceId(String provinceId);

  long countByCityId(String cityId);

  long countByDistrictId(String districtId);

  long countByWardId(String wardId);

  long countByStreetId(String streetId);

  long countByPartnerId(String partnerId);

  // OPTIMIZED: Database-level aggregation for prices and availability
  // This query calculates prices/availability at DB level to avoid loading all inventories into memory
  @Query(value = HotelQueries.FIND_HOTEL_PRICES_AND_AVAILABILITY_NATIVE, nativeQuery = true)
  List<Map<String, Object>> findHotelPricesAndAvailability(@Param("hotelIds") List<String> hotelIds);
  
  // ============ ADMIN DASHBOARD QUERIES ============
  
  /**
   * Count total active hotels in the system
   */
  @Query(DashboardQueries.COUNT_TOTAL_ACTIVE_HOTELS)
  long countTotalActiveHotels(String activeStatus);
}
