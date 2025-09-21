package com.webapp.holidate.service.location;

import com.webapp.holidate.constants.enpoint.location.LocationEndpoints;
import com.webapp.holidate.dto.request.location.CountryCreationRequest;
import com.webapp.holidate.dto.response.location.CountryDetailsResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.Country;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.CountryMapper;
import com.webapp.holidate.repository.location.CountryRepository;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CountryService {
  CountryRepository repository;
  CountryMapper mapper;

  @PostMapping
  public CountryDetailsResponse create(CountryCreationRequest request) {
    String code = request.getCode();
    boolean exists = repository.existsByCode(code);
    if (exists) {
      throw new AppException(ErrorType.COUNTRY_EXISTS);
    }

    Country country = mapper.toEntity(request);
    repository.save(country);
    return mapper.toCountryDetailsResponse(country);
  }

  @GetMapping
  public List<LocationResponse> getAll() {
    return repository.findAll().stream().map(mapper::toLocationResponse).toList();
  }

  @GetMapping(LocationEndpoints.LOCATION_ID)
  public CountryDetailsResponse getById(String id) {
    Country country = repository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.COUNTRY_NOT_FOUND));
    return mapper.toCountryDetailsResponse(country);
  }

  @DeleteMapping(LocationEndpoints.LOCATION_ID)
  public CountryDetailsResponse delete(String id) {
    Country country = repository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.COUNTRY_NOT_FOUND));
    repository.delete(country);
    return mapper.toCountryDetailsResponse(country);
  }
}
