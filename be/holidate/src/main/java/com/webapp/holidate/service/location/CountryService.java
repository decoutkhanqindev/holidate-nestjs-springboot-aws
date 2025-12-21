package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.country.CountryCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.Country;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.CountryMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.location.CountryRepository;
import com.webapp.holidate.repository.location.ProvinceRepository;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CountryService {
  CountryRepository repository;
  CountryMapper mapper;
  ProvinceRepository provinceRepository;
  HotelRepository hotelRepository;

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

  @Transactional(readOnly = true)
  public List<LocationResponse> getAll() {
    return repository.findAll().stream().map(mapper::toLocationResponse).toList();
  }

  public LocationResponse delete(String id) {
    Country country = repository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.COUNTRY_NOT_FOUND));

    // Check if country has provinces
    long provinceCount = provinceRepository.countByCountryId(id);
    if (provinceCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_COUNTRY_HAS_PROVINCES);
    }

    // Check if country has hotels
    long hotelCount = hotelRepository.countByCountryId(id);
    if (hotelCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_COUNTRY_HAS_HOTELS);
    }

    LocationResponse response = mapper.toLocationResponse(country);
    repository.delete(country);
    return response;
  }
}
