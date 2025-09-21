package com.webapp.holidate.controller.user;

import com.webapp.holidate.constants.enpoint.user.UserEndpoints;
import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.user.UserProfileResponse;
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
  public ApiResponse<List<UserProfileResponse>> getAll() {
    List<UserProfileResponse> responses = service.getAll();
    return ApiResponse.<List<UserProfileResponse>>builder()
      .data(responses)
      .build();
  }

  @GetMapping(UserEndpoints.USER_ID)
  public ApiResponse<UserProfileResponse> getById(@PathVariable String id) {
    UserProfileResponse response = service.getById(id);
    return ApiResponse.<UserProfileResponse>builder()
      .data(response)
      .build();
  }

  @PutMapping(UserEndpoints.USER_ID)
  public ApiResponse<UserProfileResponse> update(@PathVariable String id, @RequestBody @Valid UserUpdateRequest request) {
    UserProfileResponse response = service.update(id, request);
    return ApiResponse.<UserProfileResponse>builder()
      .data(response)
      .build();
  }

  @DeleteMapping(UserEndpoints.USER_ID)
  public ApiResponse<UserProfileResponse> delete(@PathVariable String id) {
    UserProfileResponse response = service.delete(id);
    return ApiResponse.<UserProfileResponse>builder()
      .data(response)
      .build();
  }
}
