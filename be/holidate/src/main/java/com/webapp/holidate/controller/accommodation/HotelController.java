package com.webapp.holidate.controller.accommodation;

import com.webapp.holidate.constants.api.endpoint.accommodation.AccommodationEndpoints;
import com.webapp.holidate.constants.api.endpoint.accommodation.HotelEndpoints;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
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
@RequestMapping(AccommodationEndpoints.ACCOMMODATION + HotelEndpoints.HOTELS)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class HotelController {
  HotelService hotelService;

  @PostMapping(consumes = "multipart/form-data")
  public ApiResponse<HotelResponse> create(@ModelAttribute @Valid HotelCreationRequest request) throws IOException {
    HotelResponse response = hotelService.create(request);
    return ApiResponse.<HotelResponse>builder()
        .data(response)
        .build();
  }

  @GetMapping
  public ApiResponse<List<HotelResponse>> getAll() {
    List<HotelResponse> responses = hotelService.getAll();
    return ApiResponse.<List<HotelResponse>>builder()
        .data(responses)
        .build();
  }
}