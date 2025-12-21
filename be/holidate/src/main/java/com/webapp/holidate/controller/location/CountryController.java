package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.endpoint.LocationEndpoints;
import com.webapp.holidate.dto.request.location.country.CountryCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.service.location.CountryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(LocationEndpoints.LOCATION + LocationEndpoints.COUNTRIES)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CountryController {
  CountryService service;

  @PostMapping
  public ApiResponse<LocationResponse> create(@RequestBody @Valid CountryCreationRequest request) {
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

  @DeleteMapping(CommonEndpoints.ID)
  public ApiResponse<LocationResponse> delete(@PathVariable String id) {
    LocationResponse response = service.delete(id);
    return ApiResponse.<LocationResponse>builder()
      .data(response)
      .build();
  }
}
