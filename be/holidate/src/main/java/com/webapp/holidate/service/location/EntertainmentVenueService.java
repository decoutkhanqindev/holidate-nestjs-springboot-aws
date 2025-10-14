package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.response.location.entertainment_venue.EntertainmentVenueCategoryResponse;
import com.webapp.holidate.dto.response.location.entertainment_venue.EntertainmentVenueResponse;
import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenue;
import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenueCategory;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.location.CityRepository;
import com.webapp.holidate.repository.location.entertainment_venue.EntertainmentVenueRepository;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class EntertainmentVenueService {
  EntertainmentVenueRepository entertainmentVenueRepository;
  CityRepository cityRepository;

  public List<EntertainmentVenueCategoryResponse> getAllByCityId(String cityId) {
    cityRepository.findById(cityId)
      .orElseThrow(() -> new AppException(ErrorType.CITY_NOT_FOUND));

    List<EntertainmentVenue> entertainmentVenues = entertainmentVenueRepository.findAllByCityId(cityId);

    Map<EntertainmentVenueCategory, List<EntertainmentVenue>> venuesByCategory = entertainmentVenues
      .stream()
      .collect(Collectors.groupingBy(EntertainmentVenue::getCategory));

    return venuesByCategory.entrySet().stream()
      .map(entry -> {
          EntertainmentVenueCategory category = entry.getKey();
          List<EntertainmentVenue> venuesInCategory = entry.getValue();

          List<EntertainmentVenueResponse> venueResponses = venuesInCategory.stream()
            .map(venue ->
              EntertainmentVenueResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .distance(0.0)
                .build()
            )
            .toList();

          return EntertainmentVenueCategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .entertainmentVenues(venueResponses)
            .build();
        }
      )
      .collect(Collectors.toList());
  }
}