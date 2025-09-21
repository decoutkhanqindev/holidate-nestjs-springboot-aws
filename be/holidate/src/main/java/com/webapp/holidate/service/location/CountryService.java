package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.country.CountryCreationRequest;
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

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CountryService {
  CountryRepository repository;
  CountryMapper mapper;

  public LocationResponse create(CountryCreationRequest request) {
    String name = request.getName();
    boolean nameExists = repository.existsByName(name);
    if (nameExists) {
      throw new AppException(ErrorType.COUNTRY_EXISTS);
    }

    String code = request.getCode();
    boolean codeExists = repository.existsByCode(code);
    if (codeExists) {
      throw new AppException(ErrorType.COUNTRY_EXISTS);
    }

    Country country = mapper.toEntity(request);
    repository.save(country);
    return mapper.toLocationResponse(country);
  }

  public List<LocationResponse> getAll() {
    return repository.findAll().stream().map(mapper::toLocationResponse).toList();
  }

  public List<LocationResponse> getAllByName(String name) {
    return repository.findAllByName(name).stream().map(mapper::toLocationResponse).toList();
  }
}
