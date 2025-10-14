package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.api.endpoint.LocationEndpoints;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.entertainment_venue.EntertainmentVenueCategoryResponse;
import com.webapp.holidate.service.location.EntertainmentVenueService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(LocationEndpoints.LOCATION + LocationEndpoints.ENTERTAINMENT_VENUES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class EntertainmentVenueController {
  EntertainmentVenueService entertainmentVenueService;

  @GetMapping(LocationEndpoints.CITY + LocationEndpoints.CITY_ID)
  public ApiResponse<List<EntertainmentVenueCategoryResponse>> getAllByCityId(@PathVariable String cityId) {
    List<EntertainmentVenueCategoryResponse> responses = entertainmentVenueService.getAllByCityId(cityId);
    return ApiResponse.<List<EntertainmentVenueCategoryResponse>>builder()
      .data(responses)
      .build();
  }
}