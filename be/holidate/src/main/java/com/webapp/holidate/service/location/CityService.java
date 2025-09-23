package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.city.CityCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.CityResponse;
import com.webapp.holidate.entity.location.City;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.CityMapper;
import com.webapp.holidate.repository.location.CityRepository;
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
  CityRepository repository;
  CityMapper mapper;

  public CityResponse create(CityCreationRequest request) {
    String name = request.getName();
    boolean nameExists = repository.existsByName(name);
    if (nameExists) {
      throw new AppException(ErrorType.CITY_EXISTS);
    }

    String code = request.getCode();
    boolean codeExists = repository.existsByCode(code);
    if (codeExists) {
      throw new AppException(ErrorType.CITY_EXISTS);
    }

    String provinceId = request.getProvinceId();
    boolean provinceExists = repository.existsByProvinceId(provinceId);
    if (provinceExists) {
      throw new AppException(ErrorType.CITY_EXISTS);
    }

    City City = mapper.toEntity(request);
    repository.save(City);
    return mapper.toCityResponse(City);
  }

  public List<LocationResponse> getAll() {
    return repository.findAll().stream().map(mapper::toLocationResponse).toList();
  }
}
