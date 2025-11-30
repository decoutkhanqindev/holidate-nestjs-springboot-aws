package com.webapp.holidate.service.user;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.webapp.holidate.constants.api.param.CommonParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.constants.api.param.UserParams;
import com.webapp.holidate.dto.request.user.UserCreationRequest;
import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.dto.response.user.UserResponse;
import com.webapp.holidate.entity.location.City;
import com.webapp.holidate.entity.location.Country;
import com.webapp.holidate.entity.location.District;
import com.webapp.holidate.entity.location.Province;
import com.webapp.holidate.entity.location.Street;
import com.webapp.holidate.entity.location.Ward;
import com.webapp.holidate.entity.user.Role;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.entity.user.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.PagedMapper;
import com.webapp.holidate.mapper.user.UserMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.booking.BookingRepository;
import com.webapp.holidate.repository.location.CityRepository;
import com.webapp.holidate.repository.location.CountryRepository;
import com.webapp.holidate.repository.location.DistrictRepository;
import com.webapp.holidate.repository.location.ProvinceRepository;
import com.webapp.holidate.repository.location.StreetRepository;
import com.webapp.holidate.repository.location.WardRepository;
import com.webapp.holidate.repository.user.RoleRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.service.storage.FileService;
import com.webapp.holidate.type.ErrorType;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor()
public class UserService {
  UserRepository userRepository;
  RoleRepository roleRepository;
  HotelRepository hotelRepository;
  BookingRepository bookingRepository;
  CountryRepository countryRepository;
  ProvinceRepository provinceRepository;
  CityRepository cityRepository;
  DistrictRepository districtRepository;
  WardRepository wardRepository;
  StreetRepository streetRepository;

  PasswordEncoder passwordEncoder;

  FileService fileService;

  UserMapper userMapper;
  PagedMapper pagedMapper;

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

  @Transactional(readOnly = true)
  public PagedResponse<UserResponse> getAll(
    String email, String fullName, String phoneNumber, String roleId, String gender,
    String countryId, String provinceId, String cityId, String districtId, String wardId, String streetId,
    Boolean active, String authProvider,
    LocalDateTime createdFrom, LocalDateTime createdTo,
    int page, int size, String sortBy, String sortDir) {
    // Clean up page and size values
    page = Math.max(0, page);
    size = Math.min(Math.max(1, size), 100);

    // Check if sort direction is valid
    boolean hasSortDir = sortDir != null && !sortDir.isEmpty()
      && (SortingParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir) ||
      SortingParams.SORT_DIR_DESC.equalsIgnoreCase(sortDir));
    if (!hasSortDir) {
      sortDir = SortingParams.SORT_DIR_DESC;
    }

    // Check if sort field is valid
    boolean hasSortBy = sortBy != null && !sortBy.isEmpty()
      && (UserParams.EMAIL_SORT.equals(sortBy) ||
      UserParams.FULL_NAME_SORT.equals(sortBy) ||
      CommonParams.CREATED_AT.equals(sortBy) ||
      UserParams.UPDATED_AT.equals(sortBy));
    if (!hasSortBy) {
      sortBy = null;
    }

    // Create Pageable with sorting
    Pageable pageable = createPageable(page, size, sortBy, sortDir);

    // Get users from database with pagination
    Page<User> userPage = userRepository.findAllWithFiltersPaged(
      email, fullName, phoneNumber, roleId, gender,
      countryId, provinceId, cityId, districtId, wardId, streetId,
      active, authProvider, createdFrom, createdTo,
      pageable);

    // Check if we have any users
    if (userPage.isEmpty()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Convert entities to response DTOs
    List<UserResponse> userResponses = userPage.getContent().stream()
      .map(userMapper::toUserResponse)
      .toList();

    // Create and return paged response with database pagination metadata
    return pagedMapper.createPagedResponse(
      userResponses,
      page,
      size,
      userPage.getTotalElements(),
      userPage.getTotalPages());
  }

  // Create Pageable object with sorting
  private Pageable createPageable(int page, int size, String sortBy, String sortDir) {
    if (sortBy == null) {
      return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // Map sort field to entity field
    String entitySortField = mapSortFieldToEntity(sortBy);
    Sort.Direction direction = SortingParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir)
      ? Sort.Direction.ASC
      : Sort.Direction.DESC;

    Sort sort = Sort.by(direction, entitySortField);
    return PageRequest.of(page, size, sort);
  }

  // Map API sort field to entity field name
  private String mapSortFieldToEntity(String sortBy) {
    return switch (sortBy) {
      case UserParams.EMAIL_SORT -> "email";
      case UserParams.FULL_NAME_SORT -> "fullName";
      case CommonParams.CREATED_AT -> "createdAt";
      case UserParams.UPDATED_AT -> "updatedAt";
      default -> "createdAt"; // Default sorting
    };
  }

  @Transactional(readOnly = true)
  public UserResponse getById(String id) {
    User user = userRepository.findByIdWithDetails(id)
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
    updateAuthInfo(user, request);

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

  private void updateAuthInfo(User user, UserUpdateRequest request) {
    Boolean newActive = request.getActive();
    if (newActive != null) {
      UserAuthInfo authInfo = user.getAuthInfo();
      if (authInfo != null) {
        boolean activeChanged = newActive != authInfo.isActive();
        if (activeChanged) {
          authInfo.setActive(newActive);
        }
      }
    }
  }

  public UserResponse delete(String id) {
    User user = userRepository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    // Check if user owns hotels
    long hotelCount = hotelRepository.countByPartnerId(id);
    if (hotelCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_USER_HAS_HOTELS);
    }

    // Check if user has bookings
    long bookingCount = bookingRepository.countByUserId(id);
    if (bookingCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_USER_HAS_BOOKINGS);
    }

    UserResponse response = userMapper.toUserResponse(user);
    userRepository.delete(user);
    return response;
  }
}
