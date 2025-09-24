package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.city.CityCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.CityResponse;
import com.webapp.holidate.entity.location.City;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.CityMapper;
import com.webapp.holidate.repository.location.CityRepository;
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

  public CityResponse create(CityCreationRequest request) {
    String name = request.getName();
    boolean nameExists = cityRepository.existsByName(name);
    if (nameExists) {
      throw new AppException(ErrorType.CITY_EXISTS);
    }

    String code = request.getCode();
    boolean codeExists = cityRepository.existsByCode(code);
    if (codeExists) {
      throw new AppException(ErrorType.CITY_EXISTS);
    }

    String provinceId = request.getProvinceId();
    boolean provinceExists = cityRepository.existsByProvinceId(provinceId);
    if (provinceExists) {
      throw new AppException(ErrorType.CITY_EXISTS);
    }

    City City = cityMapper.toEntity(request);
    cityRepository.save(City);
    return cityMapper.toCityResponse(City);
  }

  public List<LocationResponse> getAll(
    String name,
    String provinceId
  ) {
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
}
