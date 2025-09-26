package com.webapp.holidate.service.user;

import com.webapp.holidate.dto.request.user.UserCreationRequest;
import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.response.user.UserResponse;
import com.webapp.holidate.entity.location.*;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.*;
import com.webapp.holidate.mapper.user.UserMapper;
import com.webapp.holidate.repository.location.*;
import com.webapp.holidate.repository.user.RoleRepository;
import com.webapp.holidate.repository.user.UserAuthInfoRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.AuthProviderType;
import com.webapp.holidate.entity.user.Role;
import com.webapp.holidate.entity.user.UserAuthInfo;
import lombok.val;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor()
public class UserService {
  UserRepository userRepository;
  RoleRepository roleRepository;
  CountryRepository countryRepository;
  ProvinceRepository provinceRepository;
  CityRepository cityRepository;
  DistrictRepository districtRepository;
  WardRepository wardRepository;
  StreetRepository streetRepository;

  PasswordEncoder passwordEncoder;

  UserMapper userMapper;

  public UserResponse create(UserCreationRequest request) {
    String email = request.getEmail();
    boolean emailExists = userRepository.findByEmail(email).isPresent();
    if (emailExists) {
      throw new AppException(ErrorType.USER_EXISTS);
    }

    User user = userMapper.toEntity(request);

    String rawPassword = request.getPassword();
    String encodedPassword = passwordEncoder.encode(rawPassword);
    user.setPassword(encodedPassword);

    String roleId = request.getRoleId();
    Role role = roleRepository.findById(roleId)
      .orElseThrow(() -> new AppException(ErrorType.ROLE_NOT_FOUND));
    user.setRole(role);

    String countryId = request.getCountryId();
    if (countryId != null) {
      Country country = countryRepository.findById(countryId)
        .orElseThrow(() -> new AppException(ErrorType.COUNTRY_NOT_FOUND));
      user.setCountry(country);
    }

    String provinceId = request.getProvinceId();
    if (provinceId != null) {
      Province province = provinceRepository.findById(provinceId)
        .orElseThrow(() -> new AppException(ErrorType.PROVINCE_NOT_FOUND));
      user.setProvince(province);
    }

    String cityId = request.getCityId();
    if (cityId != null) {
      City city = cityRepository.findById(request.getCityId())
        .orElseThrow(() -> new AppException(ErrorType.CITY_NOT_FOUND));
      user.setCity(city);
    }

    String districtId = request.getDistrictId();
    if (districtId != null) {
      District district = districtRepository.findById(request.getDistrictId())
        .orElseThrow(() -> new AppException(ErrorType.DISTRICT_NOT_FOUND));
      user.setDistrict(district);
    }

    String wardId = request.getWardId();
    if (wardId != null) {
      Ward ward = wardRepository.findById(request.getWardId())
        .orElseThrow(() -> new AppException(ErrorType.WARD_NOT_FOUND));
      user.setWard(ward);
    }

    String streetId = request.getStreetId();
    if (streetId != null) {
      Street street = streetRepository.findById(request.getStreetId())
        .orElseThrow(() -> new AppException(ErrorType.STREET_NOT_FOUND));
      user.setStreet(street);
    }

    String authProviderStr = request.getAuthProvider();
    AuthProviderType authProvider = AuthProviderType.toAuthProvider(authProviderStr);
    boolean active = request.isActive();

    UserAuthInfo authInfo = UserAuthInfo.builder()
      .authProvider(authProvider.getValue())
      .active(active)
      .user(user)
      .build();
    user.setAuthInfo(authInfo);

    User savedUser = userRepository.save(user);
    return userMapper.toUserResponse(savedUser);
  }

  public List<UserResponse> getAll() {
    return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
  }

  public UserResponse getById(String id) {
    User user = userRepository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    return userMapper.toUserResponse(user);
  }

  public UserResponse update(String id, UserUpdateRequest request) {
    User user = userRepository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    userMapper.updateEntity(user, request);
    userRepository.save(user);
    return userMapper.toUserResponse(user);
  }

  public UserResponse delete(String id) {
    User user = userRepository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    userRepository.delete(user);
    return userMapper.toUserResponse(user);
  }
}
