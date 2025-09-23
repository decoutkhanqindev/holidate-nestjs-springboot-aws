package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.enpoint.location.DistrictEndpoints;
import com.webapp.holidate.constants.enpoint.location.LocationEndpoints;
import com.webapp.holidate.dto.request.location.district.DistrictCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.DistrictResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.service.location.DistrictService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(LocationEndpoints.LOCATION + DistrictEndpoints.DISTRICTS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DistrictController {
  DistrictService service;

  @PostMapping
  public ApiResponse<DistrictResponse> create(@RequestBody @Valid DistrictCreationRequest request) {
    DistrictResponse response = service.create(request);
    return ApiResponse.<DistrictResponse>builder()
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
