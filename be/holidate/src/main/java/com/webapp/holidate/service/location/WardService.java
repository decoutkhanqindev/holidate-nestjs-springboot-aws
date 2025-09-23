package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.ward.WardCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.WardResponse;
import com.webapp.holidate.entity.location.District;
import com.webapp.holidate.entity.location.Ward;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.WardMapper;
import com.webapp.holidate.repository.location.DistrictRepository;
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
  WardRepository wardRepository;
  DistrictRepository districtRepository;
  WardMapper wardMapper;

  public WardResponse create(WardCreationRequest request) {
    String name = request.getName();
    boolean nameExists = wardRepository.existsByName(name);
    if (nameExists) {
      throw new AppException(ErrorType.WARD_EXISTS);
    }

    String code = request.getCode();
    boolean codeExists = wardRepository.existsByCode(code);
    if (codeExists) {
      throw new AppException(ErrorType.WARD_EXISTS);
    }

    String districtId = request.getDistrictId();
    boolean districtExists = wardRepository.existsByDistrictId(districtId);
    if (districtExists) {
      throw new AppException(ErrorType.WARD_EXISTS);
    }

    Ward ward = wardMapper.toEntity(request);

    District district = districtRepository.findById(districtId)
        .orElseThrow(() -> new AppException(ErrorType.DISTRICT_NOT_FOUND));
    ward.setDistrict(district);

    wardRepository.save(ward);
    return wardMapper.toWardResponse(ward);
  }

  public List<LocationResponse> getAll() {
    return wardRepository.findAll().stream().map(wardMapper::toLocationResponse).toList();
  }
}
