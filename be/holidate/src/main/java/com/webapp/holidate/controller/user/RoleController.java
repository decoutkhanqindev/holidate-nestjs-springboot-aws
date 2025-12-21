package com.webapp.holidate.controller.user;

import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.endpoint.UserEndpoints;
import com.webapp.holidate.dto.request.user.RoleCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.user.RoleResponse;
import com.webapp.holidate.service.user.RoleService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(UserEndpoints.ROLES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoleController {
  RoleService service;

  @PostMapping
  public ApiResponse<RoleResponse> create(@RequestBody @Valid RoleCreationRequest request) {
    RoleResponse response = service.create(request);
    return ApiResponse.<RoleResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<List<RoleResponse>> getAll() {
    List<RoleResponse> responses = service.getAll();
    return ApiResponse.<List<RoleResponse>>builder()
      .data(responses)
      .build();
  }

  @DeleteMapping(CommonEndpoints.ID)
  public ApiResponse<RoleResponse> delete(@PathVariable String id) {
    RoleResponse response = service.delete(id);
    return ApiResponse.<RoleResponse>builder()
      .data(response)
      .build();
  }
}
