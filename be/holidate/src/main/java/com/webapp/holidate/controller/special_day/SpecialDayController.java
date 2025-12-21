package com.webapp.holidate.controller.special_day;

import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.endpoint.SpecialDayEndpoints;
import com.webapp.holidate.dto.request.special_day.SpecialDayCreationRequest;
import com.webapp.holidate.dto.request.special_day.SpecialDayUpdateRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.special_day.SpecialDayResponse;
import com.webapp.holidate.service.special_day.SpecialDayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(SpecialDayEndpoints.SPECIAL_DAYS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SpecialDayController {
  SpecialDayService service;

  @PostMapping
  public ApiResponse<SpecialDayResponse> create(@RequestBody @Valid SpecialDayCreationRequest request) {
    SpecialDayResponse response = service.create(request);
    return ApiResponse.<SpecialDayResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<List<SpecialDayResponse>> getAll() {
    List<SpecialDayResponse> responses = service.getAll();
    return ApiResponse.<List<SpecialDayResponse>>builder()
      .data(responses)
      .build();
  }

  @PutMapping(CommonEndpoints.ID)
  public ApiResponse<SpecialDayResponse> update(@PathVariable String id, @RequestBody SpecialDayUpdateRequest request) {
    SpecialDayResponse response = service.update(id, request);
    return ApiResponse.<SpecialDayResponse>builder()
      .data(response)
      .build();
  }

  @DeleteMapping(CommonEndpoints.ID)
  public ApiResponse<SpecialDayResponse> delete(@PathVariable String id) {
    SpecialDayResponse response = service.delete(id);
    return ApiResponse.<SpecialDayResponse>builder()
      .data(response)
      .build();
  }
}
