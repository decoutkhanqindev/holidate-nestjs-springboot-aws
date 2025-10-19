package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.response.location.entertainment_venue.EntertainmentVenueCategoryResponse;
import com.webapp.holidate.dto.response.location.entertainment_venue.EntertainmentVenueResponse;
import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenue;
import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenueCategory;
import com.webapp.holidate.entity.location.entertainment_venue.HotelEntertainmentVenue;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface EntertainmentVenueCategoryMapper {
  @Named("hotelEntertainmentVenuesToCategories")
  default List<EntertainmentVenueCategoryResponse> toEntertainmentVenuesCategoryResponseList(
    Set<HotelEntertainmentVenue> hotelEntertainmentVenues
  ) {
    boolean hasEntertainmentVenues = hotelEntertainmentVenues != null && !hotelEntertainmentVenues.isEmpty();
    if (!hasEntertainmentVenues) {
      return List.of();
    }

    // group entertainment venues by category
    Map<EntertainmentVenueCategory, List<HotelEntertainmentVenue>> entertainmentVenuesByCategory = hotelEntertainmentVenues
      .stream()
      .collect(Collectors
        .groupingBy(hotelEntertainmentVenue -> hotelEntertainmentVenue.getEntertainmentVenue().getCategory()));

    return entertainmentVenuesByCategory.entrySet().stream()
      .map(entry -> {
          EntertainmentVenueCategory category = entry.getKey();
          List<HotelEntertainmentVenue> entertainmentVenuesInCategory = entry.getValue();

          List<EntertainmentVenueResponse> entertainmentVenueResponses = entertainmentVenuesInCategory.stream()
            .map(hotelEntertainmentVenue -> {
                EntertainmentVenue venue = hotelEntertainmentVenue.getEntertainmentVenue();
                return EntertainmentVenueResponse.builder()
                  .id(venue.getId())
                  .name(venue.getName())
                  .distance(hotelEntertainmentVenue.getDistance())
                  .build();
              }
            )
            .toList();

          return EntertainmentVenueCategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .entertainmentVenues(entertainmentVenueResponses)
            .build();
        }
      )
      .toList();
  }
}
