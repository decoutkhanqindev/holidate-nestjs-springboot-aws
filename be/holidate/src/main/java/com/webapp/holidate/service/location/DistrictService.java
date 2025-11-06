package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.district.DistrictCreationRequest;
import com.webapp.holidate.dto.response.location.DistrictResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.City;
import com.webapp.holidate.entity.location.District;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.DistrictMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.location.CityRepository;
import com.webapp.holidate.repository.location.DistrictRepository;
import com.webapp.holidate.repository.location.WardRepository;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DistrictService {
  DistrictRepository districtRepository;
  CityRepository cityRepository;
  DistrictMapper districtMapper;
  WardRepository wardRepository;
  HotelRepository hotelRepository;

  public DistrictResponse create(DistrictCreationRequest request) {
    String name = request.getName();
    String code = request.getCode();
    String cityId = request.getCityId();

    // Check if city exists and fetch it
    City city = cityRepository.findById(cityId)
        .orElseThrow(() -> new AppException(ErrorType.CITY_NOT_FOUND));

    // Check if district with same name exists in this city
    boolean nameExistsInCity = districtRepository.existsByNameAndCityId(name, cityId);
    if (nameExistsInCity) {
      throw new AppException(ErrorType.DISTRICT_EXISTS);
    }

    // Check if district with same code exists in this city
    boolean codeExistsInCity = districtRepository.existsByCodeAndCityId(code, cityId);
    if (codeExistsInCity) {
      throw new AppException(ErrorType.DISTRICT_EXISTS);
    }

    District district = districtMapper.toEntity(request);
    district.setCity(city);

    districtRepository.save(district);

    // Reload district with city and province to avoid LazyInitializationException
    District savedDistrict = districtRepository.findByIdWithCityAndProvince(district.getId())
        .orElseThrow(() -> new AppException(ErrorType.DISTRICT_NOT_FOUND));

    return districtMapper.toDistrictResponse(savedDistrict);
  }

  public List<LocationResponse> getAll(
      String name,
      String cityId) {
    boolean nameProvided = name != null && !name.isBlank();
    boolean cityIdProvided = cityId != null && !cityId.isBlank();

    if (nameProvided && cityIdProvided) {
      boolean cityExists = cityRepository.existsById(cityId);
      if (!cityExists) {
        throw new AppException(ErrorType.CITY_NOT_FOUND);
      }

      return districtRepository.findAllByNameContainingIgnoreCaseAndCityId(name, cityId)
          .stream()
          .map(districtMapper::toLocationResponse)
          .toList();
    }

    if (nameProvided) {
      return districtRepository.findAllByNameContainingIgnoreCase(name)
          .stream()
          .map(districtMapper::toLocationResponse)
          .toList();
    }

    if (cityIdProvided) {
      boolean cityExists = cityRepository.existsById(cityId);
      if (!cityExists) {
        throw new AppException(ErrorType.CITY_NOT_FOUND);
      }

      return districtRepository.findAllByCityId(cityId)
          .stream()
          .map(districtMapper::toLocationResponse)
          .toList();
    }

    return districtRepository.findAll()
        .stream()
        .map(districtMapper::toLocationResponse)
        .toList();
  }

  public DistrictResponse delete(String id) {
    District district = districtRepository.findByIdWithCityAndProvince(id)
        .orElseThrow(() -> new AppException(ErrorType.DISTRICT_NOT_FOUND));

    // Check if district has wards
    long wardCount = wardRepository.countByDistrictId(id);
    if (wardCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_DISTRICT_HAS_WARDS);
    }

    // Check if district has hotels
    long hotelCount = hotelRepository.countByDistrictId(id);
    if (hotelCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_DISTRICT_HAS_HOTELS);
    }

    DistrictResponse response = districtMapper.toDistrictResponse(district);
    districtRepository.delete(district);
    return response;
  }
}
