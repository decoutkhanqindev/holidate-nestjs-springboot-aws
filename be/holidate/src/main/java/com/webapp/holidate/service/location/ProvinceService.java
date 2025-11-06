package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.province.ProvinceCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.ProvinceResponse;
import com.webapp.holidate.entity.location.Country;
import com.webapp.holidate.entity.location.Province;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.ProvinceMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.location.CityRepository;
import com.webapp.holidate.repository.location.CountryRepository;
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
public class ProvinceService {
  ProvinceRepository provinceRepository;
  CountryRepository countryRepository;
  ProvinceMapper provinceMapper;
  CityRepository cityRepository;
  HotelRepository hotelRepository;

  public ProvinceResponse create(ProvinceCreationRequest request) {
    String name = request.getName();
    String code = request.getCode();
    String countryId = request.getCountryId();

    // Check if country exists and fetch it
    Country country = countryRepository.findById(countryId)
        .orElseThrow(() -> new AppException(ErrorType.COUNTRY_NOT_FOUND));

    // Check if province with same name exists in this country
    boolean nameExistsInCountry = provinceRepository.existsByNameAndCountryId(name, countryId);
    if (nameExistsInCountry) {
      throw new AppException(ErrorType.PROVINCE_EXISTS);
    }

    // Check if province with same code exists in this country
    boolean codeExistsInCountry = provinceRepository.existsByCodeAndCountryId(code, countryId);
    if (codeExistsInCountry) {
      throw new AppException(ErrorType.PROVINCE_EXISTS);
    }

    Province province = provinceMapper.toEntity(request);
    province.setCountry(country);

    provinceRepository.save(province);
    return provinceMapper.toProvinceResponse(province);
  }

  public List<LocationResponse> getAll(
      String name,
      String countryId) {
    boolean nameProvided = name != null && !name.isBlank();
    boolean countryIdProvided = countryId != null && !countryId.isBlank();

    if (nameProvided && countryIdProvided) {
      boolean countryExists = countryRepository.existsById(countryId);
      if (!countryExists) {
        throw new AppException(ErrorType.COUNTRY_NOT_FOUND);
      }

      return provinceRepository.findAllByNameContainingIgnoreCaseAndCountryId(name, countryId)
          .stream()
          .map(provinceMapper::toLocationResponse)
          .toList();
    }

    if (nameProvided) {
      return provinceRepository.findAllByNameContainingIgnoreCase(name)
          .stream()
          .map(provinceMapper::toLocationResponse)
          .toList();
    }

    if (countryIdProvided) {
      boolean countryExists = countryRepository.existsById(countryId);
      if (!countryExists) {
        throw new AppException(ErrorType.COUNTRY_NOT_FOUND);
      }

      return provinceRepository.findAllByCountryId(countryId)
          .stream()
          .map(provinceMapper::toLocationResponse)
          .toList();
    }

    return provinceRepository.findAll()
        .stream()
        .map(provinceMapper::toLocationResponse)
        .toList();
  }

  public ProvinceResponse delete(String id) {
    Province province = provinceRepository.findById(id)
        .orElseThrow(() -> new AppException(ErrorType.PROVINCE_NOT_FOUND));

    // Check if province has cities
    long cityCount = cityRepository.countByProvinceId(id);
    if (cityCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_PROVINCE_HAS_CITIES);
    }

    // Check if province has hotels
    long hotelCount = hotelRepository.countByProvinceId(id);
    if (hotelCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_PROVINCE_HAS_HOTELS);
    }

    ProvinceResponse response = provinceMapper.toProvinceResponse(province);
    provinceRepository.delete(province);
    return response;
  }
}
