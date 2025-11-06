package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.city.CityCreationRequest;
import com.webapp.holidate.dto.response.location.CityResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.City;
import com.webapp.holidate.entity.location.Province;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.CityMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.location.CityRepository;
import com.webapp.holidate.repository.location.DistrictRepository;
import com.webapp.holidate.repository.location.ProvinceRepository;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CityService {
  CityRepository cityRepository;
  ProvinceRepository provinceRepository;
  CityMapper cityMapper;
  DistrictRepository districtRepository;
  HotelRepository hotelRepository;

  public CityResponse create(CityCreationRequest request) {
    String name = request.getName();
    String code = request.getCode();
    String provinceId = request.getProvinceId();

    // Check if province exists and fetch it
    Province province = provinceRepository.findById(provinceId)
        .orElseThrow(() -> new AppException(ErrorType.PROVINCE_NOT_FOUND));

    // Check if city with same name exists in this province
    boolean nameExistsInProvince = cityRepository.existsByNameAndProvinceId(name, provinceId);
    if (nameExistsInProvince) {
      throw new AppException(ErrorType.CITY_EXISTS);
    }

    // Check if city with same code exists in this province
    boolean codeExistsInProvince = cityRepository.existsByCodeAndProvinceId(code, provinceId);
    if (codeExistsInProvince) {
      throw new AppException(ErrorType.CITY_EXISTS);
    }

    City city = cityMapper.toEntity(request);
    city.setProvince(province);
    cityRepository.save(city);
    return cityMapper.toCityResponse(city);
  }

  public List<LocationResponse> getAll(
      String name,
      String provinceId) {
    boolean nameProvided = name != null && !name.isBlank();
    boolean provinceIdProvided = provinceId != null && !provinceId.isBlank();

    if (nameProvided && provinceIdProvided) {
      boolean provinceExists = provinceRepository.existsById(provinceId);
      if (!provinceExists) {
        throw new AppException(ErrorType.PROVINCE_NOT_FOUND);
      }

      return cityRepository.findAllByNameContainingIgnoreCaseAndProvinceId(name, provinceId)
          .stream()
          .map(cityMapper::toLocationResponse)
          .toList();
    }

    if (nameProvided) {
      return cityRepository.findAllByNameContainingIgnoreCase(name)
          .stream()
          .map(cityMapper::toLocationResponse)
          .toList();
    }

    if (provinceIdProvided) {
      boolean provinceExists = provinceRepository.existsById(provinceId);
      if (!provinceExists) {
        throw new AppException(ErrorType.PROVINCE_NOT_FOUND);
      }

      return cityRepository.findAllByProvinceId(provinceId)
          .stream()
          .map(cityMapper::toLocationResponse)
          .toList();
    }

    return cityRepository.findAll()
        .stream()
        .map(cityMapper::toLocationResponse)
        .toList();
  }

  public CityResponse delete(String id) {
    City city = cityRepository.findById(id)
        .orElseThrow(() -> new AppException(ErrorType.CITY_NOT_FOUND));

    // Check if city has districts
    long districtCount = districtRepository.countByCityId(id);
    if (districtCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_CITY_HAS_DISTRICTS);
    }

    // Check if city has hotels
    long hotelCount = hotelRepository.countByCityId(id);
    if (hotelCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_CITY_HAS_HOTELS);
    }

    CityResponse response = cityMapper.toCityResponse(city);
    cityRepository.delete(city);
    return response;
  }
}
