package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.province.ProvinceCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.ProvinceResponse;
import com.webapp.holidate.entity.location.Country;
import com.webapp.holidate.entity.location.Province;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.ProvinceMapper;
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

  public ProvinceResponse create(ProvinceCreationRequest request) {
    String name = request.getName();
    boolean nameExists = provinceRepository.existsByName(name);
    if (nameExists) {
      throw new AppException(ErrorType.PROVINCE_EXISTS);
    }

    String code = request.getCode();
    boolean codeExists = provinceRepository.existsByCode(code);
    if (codeExists) {
      throw new AppException(ErrorType.PROVINCE_EXISTS);
    }

    String countryId = request.getCountryId();
    boolean countryExists = provinceRepository.existsByCountryId(countryId);
    if (countryExists) {
      throw new AppException(ErrorType.PROVINCE_EXISTS);
    }

    Province province = provinceMapper.toEntity(request);

    Country country = countryRepository.findById(countryId)
        .orElseThrow(() -> new AppException(ErrorType.COUNTRY_NOT_FOUND));
    province.setCountry(country);

    provinceRepository.save(province);
    return provinceMapper.toProvinceResponse(province);
  }

  public List<LocationResponse> getAll() {
    return provinceRepository.findAll().stream().map(provinceMapper::toLocationResponse).toList();
  }
}
