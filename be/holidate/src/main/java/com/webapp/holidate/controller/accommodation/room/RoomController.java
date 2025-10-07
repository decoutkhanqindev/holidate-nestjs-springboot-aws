package com.webapp.holidate.controller.accommodation.room;

import com.webapp.holidate.constants.api.endpoint.AccommodationEndpoints;
import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.dto.request.acommodation.room.RoomCreationRequest;
import com.webapp.holidate.dto.request.acommodation.room.RoomUpdateRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomResponse;
import com.webapp.holidate.service.accommodation.room.RoomService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoomController {
  RoomService service;

  @PostMapping(consumes = "multipart/form-data")
  public ApiResponse<RoomDetailsResponse> create(@ModelAttribute @Valid RoomCreationRequest request) throws IOException {
    RoomDetailsResponse response = service.create(request);
    return ApiResponse.<RoomDetailsResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping(AccommodationEndpoints.HOTEL_ID)
  public ApiResponse<List<RoomResponse>> getAllByHotelId(@PathVariable String hotelId) {
    List<RoomResponse> responses = service.getAllByHotelId(hotelId);
    return ApiResponse.<List<RoomResponse>>builder()
      .data(responses)
      .build();
  }

  @PutMapping(path = CommonEndpoints.ID, consumes = "multipart/form-data")
  public ApiResponse<RoomDetailsResponse> update(
    @PathVariable String id,
    @ModelAttribute @Valid RoomUpdateRequest request
  ) throws IOException {
    RoomDetailsResponse response = service.update(id, request);
    return ApiResponse.<RoomDetailsResponse>builder()
      .data(response)
      .build();
  }
}