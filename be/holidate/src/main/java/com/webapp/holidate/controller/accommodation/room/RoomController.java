package com.webapp.holidate.controller.accommodation.room;

import com.webapp.holidate.constants.api.endpoint.AccommodationEndpoints;
import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.param.CommonParams;
import com.webapp.holidate.constants.api.param.HotelParams;
import com.webapp.holidate.constants.api.param.PaginationParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.dto.request.acommodation.room.RoomCreationRequest;
import com.webapp.holidate.dto.request.acommodation.room.RoomUpdateRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.service.accommodation.room.RoomService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping(AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoomController {
  RoomService service;

  @PostMapping(MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<RoomDetailsResponse> create(@ModelAttribute @Valid RoomCreationRequest request)
    throws IOException {
    RoomDetailsResponse response = service.create(request);
    return ApiResponse.<RoomDetailsResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<PagedResponse<RoomResponse>> getAllByHotelId(
    @RequestParam(name = HotelParams.HOTEL_ID) String hotelId,
    @RequestParam(name = CommonParams.STATUS, required = false) String status,
    @RequestParam(name = PaginationParams.PAGE, defaultValue = PaginationParams.DEFAULT_PAGE) int page,
    @RequestParam(name = PaginationParams.SIZE, defaultValue = PaginationParams.DEFAULT_SIZE) int size,
    @RequestParam(name = SortingParams.SORT_BY, required = false) String sortBy,
    @RequestParam(name = SortingParams.SORT_DIR, defaultValue = SortingParams.SORT_DIR_ASC) String sortDir) {
    PagedResponse<RoomResponse> response = service.getAllByHotelId(hotelId, status, page, size, sortBy, sortDir);
    return ApiResponse.<PagedResponse<RoomResponse>>builder()
      .data(response)
      .build();
  }

  @GetMapping(CommonEndpoints.ID)
  public ApiResponse<RoomDetailsResponse> getById(@PathVariable String id) {
    RoomDetailsResponse response = service.getById(id);
    return ApiResponse.<RoomDetailsResponse>builder()
      .data(response)
      .build();
  }

  @PutMapping(path = CommonEndpoints.ID, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<RoomDetailsResponse> update(
    @PathVariable String id,
    @ModelAttribute @Valid RoomUpdateRequest request) throws IOException {
    RoomDetailsResponse response = service.update(id, request);
    return ApiResponse.<RoomDetailsResponse>builder()
      .data(response)
      .build();
  }

  @DeleteMapping(CommonEndpoints.ID)
  public ApiResponse<RoomDetailsResponse> delete(@PathVariable String id) {
    RoomDetailsResponse response = service.delete(id);
    return ApiResponse.<RoomDetailsResponse>builder()
      .data(response)
      .build();
  }
}