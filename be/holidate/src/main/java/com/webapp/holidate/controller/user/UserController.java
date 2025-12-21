package com.webapp.holidate.controller.user;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.endpoint.UserEndpoints;
import com.webapp.holidate.constants.api.param.CommonParams;
import com.webapp.holidate.constants.api.param.FilterParams;
import com.webapp.holidate.constants.api.param.PaginationParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.constants.api.param.UserParams;
import com.webapp.holidate.dto.request.user.UserCreationRequest;
import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.dto.response.user.UserResponse;
import com.webapp.holidate.service.user.UserService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

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
  public ApiResponse<PagedResponse<UserResponse>> getAll(
    @RequestParam(name = UserParams.EMAIL, required = false) String email,
    @RequestParam(name = UserParams.FULL_NAME, required = false) String fullName,
    @RequestParam(name = UserParams.PHONE_NUMBER, required = false) String phoneNumber,
    @RequestParam(name = UserParams.ROLE_ID, required = false) String roleId,
    @RequestParam(name = UserParams.GENDER, required = false) String gender,
    @RequestParam(name = UserParams.COUNTRY_ID, required = false) String countryId,
    @RequestParam(name = UserParams.PROVINCE_ID, required = false) String provinceId,
    @RequestParam(name = UserParams.CITY_ID, required = false) String cityId,
    @RequestParam(name = UserParams.DISTRICT_ID, required = false) String districtId,
    @RequestParam(name = UserParams.WARD_ID, required = false) String wardId,
    @RequestParam(name = UserParams.STREET_ID, required = false) String streetId,
    @RequestParam(name = UserParams.ACTIVE, required = false) Boolean active,
    @RequestParam(name = UserParams.AUTH_PROVIDER, required = false) String authProvider,
    @RequestParam(name = FilterParams.CREATED_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
    @RequestParam(name = FilterParams.CREATED_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo,
    @RequestParam(name = PaginationParams.PAGE, defaultValue = PaginationParams.DEFAULT_PAGE) int page,
    @RequestParam(name = PaginationParams.SIZE, defaultValue = PaginationParams.DEFAULT_SIZE) int size,
    @RequestParam(name = SortingParams.SORT_BY, defaultValue = CommonParams.CREATED_AT) String sortBy,
    @RequestParam(name = SortingParams.SORT_DIR, defaultValue = SortingParams.SORT_DIR_DESC) String sortDir) {
    PagedResponse<UserResponse> response = service.getAll(
      email, fullName, phoneNumber, roleId, gender,
      countryId, provinceId, cityId, districtId, wardId, streetId,
      active, authProvider, createdFrom, createdTo,
      page, size, sortBy, sortDir);
    return ApiResponse.<PagedResponse<UserResponse>>builder()
      .data(response)
      .build();
  }

  @GetMapping(CommonEndpoints.ID)
  public ApiResponse<UserResponse> getById(@PathVariable String id) {
    UserResponse response = service.getById(id);
    return ApiResponse.<UserResponse>builder()
      .data(response)
      .build();
  }

  @PutMapping(path = CommonEndpoints.ID, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<UserResponse> update(
    @PathVariable String id,
    @ModelAttribute @Valid UserUpdateRequest request) throws IOException {
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
