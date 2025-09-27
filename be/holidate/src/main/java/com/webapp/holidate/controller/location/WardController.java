package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.api.endpoint.LocationEndpoints;
import com.webapp.holidate.constants.api.param.CommonParams;
import com.webapp.holidate.constants.api.param.LocationParams;
import com.webapp.holidate.dto.request.location.ward.WardCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.WardResponse;
import com.webapp.holidate.service.location.WardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(LocationEndpoints.LOCATION + LocationEndpoints.WARDS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class WardController {
  WardService service;

  @PostMapping
  public ApiResponse<WardResponse> create(@RequestBody @Valid WardCreationRequest request) {
    WardResponse response = service.create(request);
    return ApiResponse.<WardResponse>builder()
        .data(response)
        .build();
  }

  @GetMapping
  public ApiResponse<List<LocationResponse>> getAll(
      @RequestParam(value = CommonParams.NAME, required = false) String name,
      @RequestParam(value = LocationParams.DISTRICT_ID, required = false) String districtId) {
    List<LocationResponse> responses = service.getAll(name, districtId);
    return ApiResponse.<List<LocationResponse>>builder()
        .data(responses)
        .build();
  }
}
