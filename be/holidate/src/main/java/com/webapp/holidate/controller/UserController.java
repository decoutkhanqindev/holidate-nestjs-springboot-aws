package com.webapp.holidate.controller;

import com.webapp.holidate.constants.enpoint.UserEndpoints;
import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.auth.RegisterResponse;
import com.webapp.holidate.service.UserService;
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
  public ApiResponse<List<RegisterResponse>> getAll() {
    List<RegisterResponse> responses = service.getAll();
    return ApiResponse.<List<RegisterResponse>>builder()
      .data(responses)
      .build();
  }

  @GetMapping(UserEndpoints.USER_ID)
  public ApiResponse<RegisterResponse> getById(@PathVariable String id) {
    RegisterResponse response = service.getById(id);
    return ApiResponse.<RegisterResponse>builder()
      .data(response)
      .build();
  }

  @PutMapping(UserEndpoints.USER_ID)
  public ApiResponse<RegisterResponse> update(@PathVariable String id, @RequestBody @Valid UserUpdateRequest request) {
    RegisterResponse response = service.update(id, request);
    return ApiResponse.<RegisterResponse>builder()
      .data(response)
      .build();
  }

  @DeleteMapping(UserEndpoints.USER_ID)
  public ApiResponse<RegisterResponse> delete(@PathVariable String id) {
    RegisterResponse response = service.delete(id);
    return ApiResponse.<RegisterResponse>builder()
      .data(response)
      .build();
  }
}
