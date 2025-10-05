package com.webapp.holidate.controller.accommodation;

import com.webapp.holidate.constants.api.endpoint.AccommodationEndpoints;
import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.param.BookingParams;
import com.webapp.holidate.constants.api.param.LocationParams;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelUpdateRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelResponse;
import com.webapp.holidate.service.accommodation.HotelService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.HOTELS)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class HotelController {
  HotelService hotelService;

  @PostMapping(consumes = "multipart/form-data")
  public ApiResponse<HotelDetailsResponse> create(@ModelAttribute @Valid HotelCreationRequest request) throws IOException {
    HotelDetailsResponse response = hotelService.create(request);
    return ApiResponse.<HotelDetailsResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<List<HotelResponse>> getAll(
    @RequestParam(value = LocationParams.COUNTRY_ID, required = false) String countryId,
    @RequestParam(value = LocationParams.PROVINCE_ID, required = false) String provinceId,
    @RequestParam(value = LocationParams.CITY_ID, required = false) String cityId,
    @RequestParam(value = LocationParams.DISTRICT_ID, required = false) String districtId,
    @RequestParam(value = LocationParams.WARD_ID, required = false) String wardId,
    @RequestParam(value = LocationParams.STREET_ID, required = false) String streetId,
    @RequestParam(value = BookingParams.ADULTS_COUNT, required = false) Integer adultsCount,
    @RequestParam(value = BookingParams.CHILDREN_COUNT, required = false) Integer childrenCount,
    @RequestParam(value = BookingParams.ROOMS_COUNT, required = false) Integer roomsCount
  ) {
    List<HotelResponse> responses = hotelService.getAll(countryId, provinceId, cityId, districtId, wardId, streetId);
    return ApiResponse.<List<HotelResponse>>builder()
      .data(responses)
      .build();
  }

  @GetMapping(CommonEndpoints.ID)
  public ApiResponse<HotelDetailsResponse> getById(@PathVariable String id) {
    HotelDetailsResponse response = hotelService.getById(id);
    return ApiResponse.<HotelDetailsResponse>builder()
      .data(response)
      .build();
  }

  @PutMapping(value = CommonEndpoints.ID, consumes = "application/json")
  public ApiResponse<HotelDetailsResponse> update(
    @PathVariable String id,
    @RequestBody @Valid HotelUpdateRequest request
  ) throws IOException {
    HotelDetailsResponse response = hotelService.update(id, request);
    return ApiResponse.<HotelDetailsResponse>builder()
      .data(response)
      .build();
  }
}