package com.webapp.holidate.controller.amenity;

import com.webapp.holidate.constants.api.endpoint.AmenityEndpoints;
import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.dto.request.amenity.AmenityCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.amenity.AmenityDetailsResponse;
import com.webapp.holidate.service.amenity.AmenityService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AmenityEndpoints.AMENITY + AmenityEndpoints.AMENITIES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AmenityController {
  AmenityService service;

  @PostMapping
  public ApiResponse<AmenityDetailsResponse> create(@RequestBody @Valid AmenityCreationRequest request) {
    AmenityDetailsResponse response = service.create(request);
    return ApiResponse.<AmenityDetailsResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping()
  public ApiResponse<List<AmenityDetailsResponse>> getAll() {
    List<AmenityDetailsResponse> responses = service.getAll();
    return ApiResponse.<List<AmenityDetailsResponse>>builder()
      .data(responses)
      .build();
  }


  @GetMapping(AmenityEndpoints.AMENITY_CATEGORY + AmenityEndpoints.AMENITY_CATEGORY_ID)
  public ApiResponse<List<AmenityDetailsResponse>> getAllByCategoryId(@PathVariable String categoryId) {
    List<AmenityDetailsResponse> responses = service.getAllByCategoryId(categoryId);
    return ApiResponse.<List<AmenityDetailsResponse>>builder()
      .data(responses)
      .build();
  }

  @DeleteMapping(CommonEndpoints.ID)
  public ApiResponse<AmenityDetailsResponse> delete(@PathVariable String id) {
    AmenityDetailsResponse response = service.delete(id);
    return ApiResponse.<AmenityDetailsResponse>builder()
      .data(response)
      .build();
  }
}
