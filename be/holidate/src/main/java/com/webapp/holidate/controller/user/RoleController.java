package com.webapp.holidate.controller.user;

import com.webapp.holidate.constants.enpoint.user.RoleEndpoints;
import com.webapp.holidate.dto.request.user.RoleCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.user.RoleDetailsResponse;
import com.webapp.holidate.service.user.RoleService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(RoleEndpoints.ROLES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoleController {
  RoleService service;

  @PostMapping
  public ApiResponse<RoleDetailsResponse> create(@RequestBody @Valid RoleCreationRequest request) {
    RoleDetailsResponse response = service.create(request);
    return ApiResponse.<RoleDetailsResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<List<RoleDetailsResponse>> getAll() {
    List<RoleDetailsResponse> responses = service.getAll();
    return ApiResponse.<List<RoleDetailsResponse>>builder()
      .data(responses)
      .build();
  }

  @DeleteMapping(RoleEndpoints.ROLE_ID)
  public ApiResponse<RoleDetailsResponse> delete(@PathVariable String id) {
    RoleDetailsResponse response = service.delete(id);
    return ApiResponse.<RoleDetailsResponse>builder()
      .data(response)
      .build();
  }
}
