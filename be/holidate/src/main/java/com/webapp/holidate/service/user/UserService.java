package com.webapp.holidate.service.user;

import com.webapp.holidate.dto.request.user.UserCreationRequest;
import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.response.user.UserResponse;
import com.webapp.holidate.entity.location.*;
import com.webapp.holidate.entity.user.Role;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.entity.user.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.user.UserMapper;
import com.webapp.holidate.repository.location.*;
import com.webapp.holidate.repository.user.RoleRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.service.storage.FileService;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
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

  FileService fileService;

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

    String authProvider = request.getAuthProvider();

    UserAuthInfo authInfo = UserAuthInfo.builder()
      .authProvider(authProvider)
      .otpAttempts(0)
      .active(false)
      .user(user)
      .build();
    user.setAuthInfo(authInfo);

    userRepository.save(user);
    return userMapper.toUserResponse(user);
  }

  public List<UserResponse> getAll() {
    return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
  }

  public UserResponse getById(String id) {
    User user = userRepository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    return userMapper.toUserResponse(user);
  }

  @Transactional
  public UserResponse update(String id, UserUpdateRequest request) throws IOException {
    User user = userRepository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    updateInfo(user, request);
    updateLocation(user, request);
    updateAvatar(user, request);

    user.setUpdatedAt(LocalDateTime.now());
    userRepository.save(user);
    return userMapper.toUserResponse(user);
  }

  private void updateInfo(User user, UserUpdateRequest request) {
    String newFullName = request.getFullName();
    if (newFullName != null && !newFullName.trim().equals(user.getFullName())) {
      user.setFullName(newFullName.trim());
    }

    String newPhoneNumber = request.getPhoneNumber();
    if (newPhoneNumber != null && !newPhoneNumber.trim().equals(user.getPhoneNumber())) {
      user.setPhoneNumber(newPhoneNumber.trim());
    }

    String newAddress = request.getAddress();
    if (newAddress != null && !newAddress.trim().equals(user.getAddress())) {
      user.setAddress(newAddress.trim());
    }

    String newGender = request.getGender();
    boolean genderChanged = newGender != null && !newGender.equals(user.getGender());
    if (genderChanged) {
      user.setGender(newGender);
    }

    LocalDateTime newDateOfBirth = request.getDateOfBirth();
    boolean dateOfBirthChanged = newDateOfBirth != null && !newDateOfBirth.equals(user.getDateOfBirth());
    if (dateOfBirthChanged) {
      user.setDateOfBirth(newDateOfBirth);
    }
  }

  private void updateAvatar(User user, UserUpdateRequest request) throws IOException {
    MultipartFile avatarFile = request.getAvatarFile();
    boolean hasAvatarFile = avatarFile != null && !avatarFile.isEmpty();
    if (hasAvatarFile) {
      String currentAvatarUrl = user.getAvatarUrl();
      boolean hasCurrentAvatar = currentAvatarUrl != null && !currentAvatarUrl.isEmpty();
      if (hasCurrentAvatar) {
        fileService.delete(currentAvatarUrl);
      }

      fileService.upload(avatarFile);

      String originalFilename = avatarFile.getOriginalFilename();
      boolean hasOriginalFilename = originalFilename != null && !originalFilename.isEmpty();
      if (hasOriginalFilename) {
        String newAvatarFileUrl = fileService.createFileUrl(originalFilename);
        user.setAvatarUrl(newAvatarFileUrl);
      }
    }
  }

  private void updateLocation(User user, UserUpdateRequest request) {
    String newCountryId = request.getCountryId();
    String currentCountryId = user.getCountry() != null ? user.getCountry().getId() : null;
    boolean countryChanged = newCountryId != null && !newCountryId.equals(currentCountryId);
    if (countryChanged) {
      Country country = countryRepository.findById(newCountryId)
        .orElseThrow(() -> new AppException(ErrorType.COUNTRY_NOT_FOUND));
      user.setCountry(country);
    }

    String newProvinceId = request.getProvinceId();
    String currentProvinceId = user.getProvince() != null ? user.getProvince().getId() : null;
    boolean provinceChanged = newProvinceId != null && !newProvinceId.equals(currentProvinceId);
    if (provinceChanged) {
      Province province = provinceRepository.findById(newProvinceId)
        .orElseThrow(() -> new AppException(ErrorType.PROVINCE_NOT_FOUND));
      user.setProvince(province);
    }

    String newCityId = request.getCityId();
    String currentCityId = user.getCity() != null ? user.getCity().getId() : null;
    boolean cityChanged = newCityId != null && !newCityId.equals(currentCityId);
    if (cityChanged) {
      City city = cityRepository.findById(newCityId)
        .orElseThrow(() -> new AppException(ErrorType.CITY_NOT_FOUND));
      user.setCity(city);
    }

    String newDistrictId = request.getDistrictId();
    String currentDistrictId = user.getDistrict() != null ? user.getDistrict().getId() : null;
    boolean districtChanged = newDistrictId != null && !newDistrictId.equals(currentDistrictId);
    if (districtChanged) {
      District district = districtRepository.findById(newDistrictId)
        .orElseThrow(() -> new AppException(ErrorType.DISTRICT_NOT_FOUND));
      user.setDistrict(district);
    }

    String newWardId = request.getWardId();
    String currentWardId = user.getWard() != null ? user.getWard().getId() : null;
    boolean wardChanged = newWardId != null && !newWardId.equals(currentWardId);
    if (wardChanged) {
      Ward ward = wardRepository.findById(newWardId)
        .orElseThrow(() -> new AppException(ErrorType.WARD_NOT_FOUND));
      user.setWard(ward);
    }

    String newStreetId = request.getStreetId();
    String currentStreetId = user.getStreet() != null ? user.getStreet().getId() : null;
    boolean streetChanged = newStreetId != null && !newStreetId.equals(currentStreetId);
    if (streetChanged) {
      Street street = streetRepository.findById(newStreetId)
        .orElseThrow(() -> new AppException(ErrorType.STREET_NOT_FOUND));
      user.setStreet(street);
    }
  }

  public UserResponse delete(String id) {
    User user = userRepository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    userRepository.delete(user);
    return userMapper.toUserResponse(user);
  }
}
