package com.webapp.holidate.controller.location;

import com.webapp.holidate.constants.db.query.location.CountryEndpoints;
import com.webapp.holidate.constants.db.query.location.LocationEndpoints;
import com.webapp.holidate.constants.db.query.location.ProvinceEndpoints;
import com.webapp.holidate.dto.request.location.country.CountryCreationRequest;
import com.webapp.holidate.dto.request.location.province.ProvinceCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.Province;
import com.webapp.holidate.service.location.CountryService;
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
   public ApiResponse<LocationResponse> create(@RequestBody @Valid ProvinceCreationRequest request) {
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
