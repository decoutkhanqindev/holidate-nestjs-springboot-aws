package com.webapp.holidate.repository.accommodation;

import com.webapp.holidate.constants.db.query.accommodation.HotelQueries;
import com.webapp.holidate.entity.accommodation.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.Nullable;

import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, String>, JpaSpecificationExecutor<Hotel> {
  boolean existsByName(String name);

  @Query(HotelQueries.FIND_ALL_WITH_LOCATIONS_PHOTOS_POLICY)
  List<Hotel> findAllWithLocationsPhotosPolicy();

  @Query(HotelQueries.FIND_ALL_IDS_BY_FILTER)
  List<String> findAllIdsByFilter(
    @Nullable String countryId,
    @Nullable String provinceId,
    @Nullable String cityId,
    @Nullable String districtId,
    @Nullable String wardId,
    @Nullable String streetId,
    @Nullable List<String> amenityIds,
    int amenityIdsCount,
    @Nullable Integer starRating,
    @Nullable Double minPrice,
    @Nullable Double maxPrice
  );

  @Query(HotelQueries.FIND_ALL_BY_IDS_WITH_LOCATIONS_PHOTOS_POLICY)
  List<Hotel> findAllByIdsFilterWithLocationsPhotosPolicy(List<String> hotelIds);

  @Query(HotelQueries.FIND_ALL_BY_IDS_WITH_ROOMS_AND_INVENTORIES)
  List<Hotel> findAllByIdsWithRoomsAndInventories(List<String> hotelIds);

  @Query(HotelQueries.FIND_BY_ID_WITH_LOCATIONS_PHOTOS_AMENITIES_REVIEWS_PARTNER_POLICY)
  Optional<Hotel> findByIdWithLocationsPhotosAmenitiesReviewsPartnerPolicy(String id);
}
