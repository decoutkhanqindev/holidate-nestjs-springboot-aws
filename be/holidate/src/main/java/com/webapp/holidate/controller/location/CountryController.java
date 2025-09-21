package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.enpoint.location.LocationEndpoints;
import com.webapp.holidate.dto.request.location.CountryCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.CountryDetailsResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.service.location.CountryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(LocationEndpoints.LOCATION + LocationEndpoints.COUNTRIES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CountryController {
  CountryService service;

  @PostMapping
  public ApiResponse<CountryDetailsResponse> create(@RequestBody @Valid CountryCreationRequest request) {
    CountryDetailsResponse response = service.create(request);
    return ApiResponse.<CountryDetailsResponse>builder()
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

  @GetMapping(LocationEndpoints.LOCATION_ID)
  public ApiResponse<CountryDetailsResponse> getById(@PathVariable String id) {
    CountryDetailsResponse response = service.getById(id);
    return ApiResponse.<CountryDetailsResponse>builder()
      .data(response)
      .build();
  }

  @DeleteMapping(LocationEndpoints.LOCATION_ID)
  public ApiResponse<CountryDetailsResponse> delete(@PathVariable String id) {
    CountryDetailsResponse response = service.delete(id);
    return ApiResponse.<CountryDetailsResponse>builder()
      .data(response)
      .build();
  }
}
