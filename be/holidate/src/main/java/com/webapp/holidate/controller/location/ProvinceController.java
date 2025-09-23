package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.enpoint.location.LocationEndpoints;
import com.webapp.holidate.constants.enpoint.location.ProvinceEndpoints;
import com.webapp.holidate.dto.request.location.province.ProvinceCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.ProvinceResponse;
import com.webapp.holidate.service.location.ProvinceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(LocationEndpoints.LOCATION + ProvinceEndpoints.PROVINCES)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ProvinceController {
  ProvinceService service;

  @PostMapping
  public ApiResponse<ProvinceResponse> create(@RequestBody @Valid ProvinceCreationRequest request) {
    ProvinceResponse response = service.create(request);
    return ApiResponse.<ProvinceResponse>builder()
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
