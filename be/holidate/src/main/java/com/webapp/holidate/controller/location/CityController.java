package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.api.endpoint.LocationEndpoints;
import com.webapp.holidate.constants.api.param.CommonParams;
import com.webapp.holidate.constants.api.param.LocationParams;
import com.webapp.holidate.dto.request.location.city.CityCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.CityResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.service.location.CityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(LocationEndpoints.LOCATION + LocationEndpoints.CITIES)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CityController {
  CityService service;

  @PostMapping
  public ApiResponse<CityResponse> create(@RequestBody @Valid CityCreationRequest request) {
    CityResponse response = service.create(request);
    return ApiResponse.<CityResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<List<LocationResponse>> getAll(
    @RequestParam(value = CommonParams.NAME, required = false) String name,
    @RequestParam(value = LocationParams.PROVINCE_ID, required = false) String provinceId) {
    List<LocationResponse> responses = service.getAll(name, provinceId);
    return ApiResponse.<List<LocationResponse>>builder()
      .data(responses)
      .build();
  }
}
