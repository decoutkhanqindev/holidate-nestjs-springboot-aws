package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.db.query.location.WardEndpoints;
import com.webapp.holidate.constants.db.query.location.LocationEndpoints;
import com.webapp.holidate.dto.request.location.ward.WardCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.service.location.WardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(LocationEndpoints.LOCATION + WardEndpoints.WARDS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class WardController {
  WardService service;

  @PostMapping
  public ApiResponse<LocationResponse> create(@RequestBody @Valid WardCreationRequest request) {
    LocationResponse response = service.create(request);
    return ApiResponse.<LocationResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<List<LocationResponse>> getAll() {
    List<LocationResponse> responses = service.getAll();
    return ApiResponse.<List<LocationResponse>>builder()
      .data(responses)
      .build();
  }
}
