package com.webapp.holidate.controller.accommodation;

import com.webapp.holidate.constants.api.endpoint.AccommodationEndpoints;
import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.param.*;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelUpdateRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.service.accommodation.HotelService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
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

  @PostMapping
  public ApiResponse<HotelDetailsResponse> create(@RequestBody @Valid HotelCreationRequest request)
    throws IOException {
    HotelDetailsResponse response = hotelService.create(request);
    return ApiResponse.<HotelDetailsResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<PagedResponse<HotelResponse>> getAll(
    @RequestParam(name = CommonParams.NAME, required = false) String name,
    @RequestParam(name = LocationParams.COUNTRY_ID, required = false) String countryId,
    @RequestParam(name = LocationParams.PROVINCE_ID, required = false) String provinceId,
    @RequestParam(name = LocationParams.CITY_ID, required = false) String cityId,
    @RequestParam(name = LocationParams.DISTRICT_ID, required = false) String districtId,
    @RequestParam(name = LocationParams.WARD_ID, required = false) String wardId,
    @RequestParam(name = LocationParams.STREET_ID, required = false) String streetId,
    @RequestParam(name = HotelParams.STAR_RATING, required = false) Integer starRating,
    @RequestParam(name = HotelParams.AMENITY_IDS, required = false) List<String> amenityIds,
    @RequestParam(name = CommonParams.STATUS, required = false) String status,
    @RequestParam(name = RoomParams.CHECKIN_DATE, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkinDate,
    @RequestParam(name = RoomParams.CHECKOUT_DATE, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkoutDate,
    @RequestParam(name = RoomParams.REQUIRED_ADULTS, required = false) Integer requiredAdults,
    @RequestParam(name = RoomParams.REQUIRED_CHILDREN, required = false) Integer requiredChildren,
    @RequestParam(name = RoomParams.REQUIRED_ROOMS, required = false) Integer requiredRooms,
    @RequestParam(name = FilterParams.MIN_PRICE, required = false) Double minPrice,
    @RequestParam(name = FilterParams.MAX_PRICE, required = false) Double maxPrice,
    @RequestParam(name = PaginationParams.PAGE, defaultValue = PaginationParams.DEFAULT_PAGE) int page,
    @RequestParam(name = PaginationParams.SIZE, defaultValue = PaginationParams.DEFAULT_SIZE) int size,
    @RequestParam(name = SortingParams.SORT_BY, defaultValue = CommonParams.CREATED_AT) String sortBy,
    @RequestParam(name = SortingParams.SORT_DIR, defaultValue = SortingParams.SORT_DIR_ASC) String sortDir) {
    PagedResponse<HotelResponse> response = hotelService.getAll(
      name, countryId, provinceId, cityId, districtId, wardId, streetId,
      amenityIds, starRating, status,
      checkinDate, checkoutDate, requiredAdults, requiredChildren, requiredRooms, minPrice, maxPrice,
      page, size, sortBy, sortDir);
    return ApiResponse.<PagedResponse<HotelResponse>>builder()
      .data(response)
      .build();
  }

  @GetMapping(CommonEndpoints.ID)
  public ApiResponse<HotelDetailsResponse> getById(@PathVariable String id) {
    HotelDetailsResponse response = hotelService.getById(id);
    return ApiResponse.<HotelDetailsResponse>builder()
      .data(response)
      .build();
  }

  @PutMapping(path = CommonEndpoints.ID, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<HotelDetailsResponse> update(
    @PathVariable String id,
    @ModelAttribute @Valid HotelUpdateRequest request) throws IOException {
    HotelDetailsResponse response = hotelService.update(id, request);
    return ApiResponse.<HotelDetailsResponse>builder()
      .data(response)
      .build();
  }

  @DeleteMapping(CommonEndpoints.ID)
  public ApiResponse<HotelDetailsResponse> delete(@PathVariable String id) {
    HotelDetailsResponse response = hotelService.delete(id);
    return ApiResponse.<HotelDetailsResponse>builder()
      .data(response)
      .build();
  }
}