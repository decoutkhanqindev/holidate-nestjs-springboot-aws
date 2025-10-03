package com.webapp.holidate.mapper.amenity;

import com.webapp.holidate.dto.request.amenity.AmenityCategoryCreationRequest;
import com.webapp.holidate.dto.response.amenity.AmenityCategoryResponse;
import com.webapp.holidate.dto.response.amenity.AmenityResponse;
import com.webapp.holidate.entity.accommodation.amenity.AmenityCategory;
import com.webapp.holidate.entity.accommodation.amenity.HotelAmenity;
import com.webapp.holidate.entity.accommodation.amenity.RoomAmenity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AmenityCategoryMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "amenities", ignore = true)
  AmenityCategory toEntity(AmenityCategoryCreationRequest request);

  AmenityCategoryResponse toAmenityCategoryResponse(AmenityCategory amenityCategory);

  @Named("hotelAmenitiesToCategories")
  default List<AmenityCategoryResponse> toAmenityCategoryResponse(Set<HotelAmenity> hotelAmenities) {
    boolean hasAmenities = hotelAmenities != null && !hotelAmenities.isEmpty();
    if (!hasAmenities) {
      return List.of();
    }

    // group amenities by category
    Map<AmenityCategory, List<HotelAmenity>> amenitiesByCategory = hotelAmenities.stream()
      .collect(Collectors.groupingBy(hotelAmenity -> hotelAmenity.getAmenity().getCategory()));

    return amenitiesByCategory.entrySet().stream()
      .map(entry -> {
          AmenityCategory category = entry.getKey();
          List<HotelAmenity> amenitiesInCategory = entry.getValue();

          List<AmenityResponse> amenityResponses = amenitiesInCategory.stream()
            .map(hotelAmenity ->
              AmenityResponse.builder()
                .id(hotelAmenity.getAmenity().getId())
                .name(hotelAmenity.getAmenity().getName())
                .free(hotelAmenity.getAmenity().isFree())
                .build()
            )
            .collect(Collectors.toList());

          return AmenityCategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .amenities(amenityResponses)
            .build();
        }
      )
      .collect(Collectors.toList());
  }

  @Named("roomAmenitiesToCategories")
  default List<AmenityCategoryResponse> toRoomAmenityCategoryResponse(Set<RoomAmenity> roomAmenities) {
    boolean hasAmenities = roomAmenities != null && !roomAmenities.isEmpty();
    if (!hasAmenities) {
      return List.of();
    }

    // group amenities by category
    Map<AmenityCategory, List<RoomAmenity>> amenitiesByCategory = roomAmenities.stream()
      .collect(Collectors.groupingBy(roomAmenity -> roomAmenity.getAmenity().getCategory()));

    return amenitiesByCategory.entrySet().stream()
      .map(entry -> {
          AmenityCategory category = entry.getKey();
          List<RoomAmenity> amenitiesInCategory = entry.getValue();

          List<AmenityResponse> amenityResponses = amenitiesInCategory.stream()
            .map(roomAmenity ->
              AmenityResponse.builder()
                .id(roomAmenity.getAmenity().getId())
                .name(roomAmenity.getAmenity().getName())
                .free(roomAmenity.getAmenity().isFree())
                .build()
            )
            .collect(Collectors.toList());

          return AmenityCategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .amenities(amenityResponses)
            .build();
        }
      )
      .collect(Collectors.toList());
  }
}
