package com.webapp.holidate.controller.user;

import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.endpoint.UserEndpoints;
import com.webapp.holidate.dto.request.user.UserCreationRequest;
import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.user.UserResponse;
import com.webapp.holidate.service.user.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(UserEndpoints.USERS)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor()
public class UserController {
  UserService service;

  @PostMapping
  public ApiResponse<UserResponse> create(@RequestBody @Valid UserCreationRequest request) {
    UserResponse response = service.create(request);
    return ApiResponse.<UserResponse>builder()
        .data(response)
        .build();
  }

  @GetMapping
  public ApiResponse<List<UserResponse>> getAll() {
    List<UserResponse> responses = service.getAll();
    return ApiResponse.<List<UserResponse>>builder()
        .data(responses)
        .build();
  }

  @GetMapping(CommonEndpoints.ID)
  public ApiResponse<UserResponse> getById(@PathVariable String id) {
    UserResponse response = service.getById(id);
    return ApiResponse.<UserResponse>builder()
        .data(response)
        .build();
  }

  @PutMapping(CommonEndpoints.ID)
  public ApiResponse<UserResponse> update(@PathVariable String id, @RequestBody @Valid UserUpdateRequest request) {
    UserResponse response = service.update(id, request);
    return ApiResponse.<UserResponse>builder()
        .data(response)
        .build();
  }

  @DeleteMapping(CommonEndpoints.ID)
  public ApiResponse<UserResponse> delete(@PathVariable String id) {
    UserResponse response = service.delete(id);
    return ApiResponse.<UserResponse>builder()
        .data(response)
        .build();
  }
}
