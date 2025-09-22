package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.district.DistrictCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.District;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.DistrictMapper;
import com.webapp.holidate.repository.location.DistrictRepository;
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
  DistrictRepository repository;
  DistrictMapper mapper;

  public LocationResponse create(DistrictCreationRequest request) {
    String name = request.getName();
    boolean nameExists = repository.existsByName(name);
    if (nameExists) {
      throw new AppException(ErrorType.DISTRICT_EXISTS);
    }

    String code = request.getCode();
    boolean codeExists = repository.existsByCode(code);
    if (codeExists) {
      throw new AppException(ErrorType.DISTRICT_EXISTS);
    }

    String cityId = request.getCityId();
    boolean cityExists = repository.existsByCityId(cityId);
    if (cityExists) {
      throw new AppException(ErrorType.DISTRICT_EXISTS);
    }

    District District = mapper.toEntity(request);
    repository.save(District);
    return mapper.toLocationResponse(District);
  }

  public List<LocationResponse> getAll() {
    return repository.findAll().stream().map(mapper::toLocationResponse).toList();
  }
}
