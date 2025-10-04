package com.webapp.holidate.controller.amenity;

import com.webapp.holidate.constants.api.endpoint.AmenityEndpoints;
import com.webapp.holidate.dto.request.amenity.AmenityCategoryCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.amenity.AmenityCategoryResponse;
import com.webapp.holidate.service.amenity.AmenityCategoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AmenityEndpoints.AMENITY + AmenityEndpoints.AMENITY_CATEGORIES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AmenityCategoryController {
  AmenityCategoryService service;

  @PostMapping
  public ApiResponse<AmenityCategoryResponse> create(@RequestBody @Valid AmenityCategoryCreationRequest request) {
    AmenityCategoryResponse response = service.create(request);
    return ApiResponse.<AmenityCategoryResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<List<AmenityCategoryResponse>> getAll() {
    List<AmenityCategoryResponse> responses = service.getAll();
    return ApiResponse.<List<AmenityCategoryResponse>>builder()
      .data(responses)
      .build();
  }
}
