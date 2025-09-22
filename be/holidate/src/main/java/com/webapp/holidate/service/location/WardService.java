package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.ward.WardCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.Ward;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.WardMapper;
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
public class WardService {
  WardRepository repository;
  WardMapper mapper;

  public LocationResponse create(WardCreationRequest request) {
    String name = request.getName();
    boolean nameExists = repository.existsByName(name);
    if (nameExists) {
      throw new AppException(ErrorType.WARD_EXISTS);
    }

    String code = request.getCode();
    boolean codeExists = repository.existsByCode(code);
    if (codeExists) {
      throw new AppException(ErrorType.WARD_EXISTS);
    }

    String districtId = request.getDistrictId();
    boolean districtExists = repository.existsByDistrictId(districtId);
    if (districtExists) {
      throw new AppException(ErrorType.WARD_EXISTS);
    }

    Ward ward = mapper.toEntity(request);
    repository.save(ward);
    return mapper.toLocationResponse(ward);
  }

  public List<LocationResponse> getAll() {
    return repository.findAll().stream().map(mapper::toLocationResponse).toList();
  }
}
