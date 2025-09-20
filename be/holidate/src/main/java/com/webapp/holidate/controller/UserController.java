package com.webapp.holidate.controller;

import com.webapp.holidate.constants.enpoint.UserEndpoints;
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

  @GetMapping
  public ApiResponse<List<UserResponse>> getAll() {
    List<UserResponse> responses = service.getAll();
    return ApiResponse.<List<UserResponse>>builder()
      .data(responses)
      .build();
  }

  @GetMapping(UserEndpoints.USER_ID)
  public ApiResponse<UserResponse> getById(@PathVariable String id) {
    UserResponse response = service.getById(id);
    return ApiResponse.<UserResponse>builder()
      .data(response)
      .build();
  }

  @PutMapping(UserEndpoints.USER_ID)
  public ApiResponse<UserResponse> update(@PathVariable String id, @RequestBody @Valid UserUpdateRequest request) {
    UserResponse response = service.update(id, request);
    return ApiResponse.<UserResponse>builder()
      .data(response)
      .build();
  }

  @DeleteMapping(UserEndpoints.USER_ID)
  public ApiResponse<UserResponse> delete(@PathVariable String id) {
    UserResponse response = service.delete(id);
    return ApiResponse.<UserResponse>builder()
      .data(response)
      .build();
  }
}
