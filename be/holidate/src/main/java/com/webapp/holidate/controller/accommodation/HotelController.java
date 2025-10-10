package com.webapp.holidate.controller.accommodation;

import com.webapp.holidate.constants.api.endpoint.AccommodationEndpoints;
import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.param.HotelParams;
import com.webapp.holidate.constants.api.param.LocationParams;
import com.webapp.holidate.constants.api.param.RoomParams;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.HOTELS)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class HotelController {
  HotelService hotelService;

  @PostMapping(consumes = "multipart/form-data")
  public ApiResponse<HotelDetailsResponse> create(@ModelAttribute @Valid HotelCreationRequest request)
    throws IOException {
    HotelDetailsResponse response = hotelService.create(request);
    return ApiResponse.<HotelDetailsResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<List<HotelResponse>> getAll(
    @RequestParam(name = LocationParams.COUNTRY_ID, required = false) String countryId,
    @RequestParam(name = LocationParams.PROVINCE_ID, required = false) String provinceId,
    @RequestParam(name = LocationParams.CITY_ID, required = false) String cityId,
    @RequestParam(name = LocationParams.DISTRICT_ID, required = false) String districtId,
    @RequestParam(name = LocationParams.WARD_ID, required = false) String wardId,
    @RequestParam(name = LocationParams.STREET_ID, required = false) String streetId,
    @RequestParam(name = HotelParams.STAR_RATING, required = false) Integer starRating,
    @RequestParam(name = HotelParams.AMENITY_IDS, required = false) List<String> amenityIds,
    @RequestParam(name = RoomParams.CHECKIN_DATE, required = false)
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkinDate,
    @RequestParam(name = RoomParams.CHECKOUT_DATE, required = false)
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkoutDate,
    @RequestParam(name = RoomParams.REQUIRED_ADULTS, required = false) Integer requiredAdults,
    @RequestParam(name = RoomParams.REQUIRED_CHILDREN, required = false) Integer requiredChildren,
    @RequestParam(name = RoomParams.REQUIRED_ROOMS, required = false) Integer requiredRooms,
    @RequestParam(name = RoomParams.MIN_PRICE, required = false) Double minPrice,
    @RequestParam(name = RoomParams.MAX_PRICE, required = false) Double maxPrice
  ) {
    List<HotelResponse> responses = hotelService.getAll(
      countryId, provinceId, cityId, districtId, wardId, streetId, amenityIds, starRating,
      checkinDate, checkoutDate, requiredAdults, requiredChildren, requiredRooms, minPrice, maxPrice
    );
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

  @PutMapping(path = CommonEndpoints.ID, consumes = "multipart/form-data")
  public ApiResponse<HotelDetailsResponse> update(
    @PathVariable String id,
    @RequestBody @Valid HotelUpdateRequest request) throws IOException {
    HotelDetailsResponse response = hotelService.update(id, request);
    return ApiResponse.<HotelDetailsResponse>builder()
      .data(response)
      .build();
  }
}