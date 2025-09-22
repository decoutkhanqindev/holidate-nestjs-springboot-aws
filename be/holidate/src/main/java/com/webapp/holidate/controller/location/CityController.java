package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.db.query.location.CityEndpoints;
import com.webapp.holidate.constants.db.query.location.LocationEndpoints;
import com.webapp.holidate.dto.request.location.city.CityCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.service.location.CityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(LocationEndpoints.LOCATION + CityEndpoints.CITIES)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CityController {
  CityService service;

  @PostMapping
   public ApiResponse<LocationResponse> create(@RequestBody @Valid CityCreationRequest request) {
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
