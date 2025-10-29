package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.api.endpoint.LocationEndpoints;
import com.webapp.holidate.constants.api.param.CommonParams;
import com.webapp.holidate.constants.api.param.LocationParams;
import com.webapp.holidate.dto.request.location.street.StreetCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.StreetResponse;
import com.webapp.holidate.service.location.StreetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(LocationEndpoints.LOCATION + LocationEndpoints.STREETS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class StreetController {
  StreetService service;

  @PostMapping
  public ApiResponse<StreetResponse> create(@RequestBody @Valid StreetCreationRequest request) {
    StreetResponse response = service.create(request);
    return ApiResponse.<StreetResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<List<LocationResponse>> getAll(
    @RequestParam(value = CommonParams.NAME, required = false) String name,
    @RequestParam(value = LocationParams.WARD_ID, required = false) String wardId) {
    List<LocationResponse> responses = service.getAll(name, wardId);
    return ApiResponse.<List<LocationResponse>>builder()
      .data(responses)
      .build();
  }
}
