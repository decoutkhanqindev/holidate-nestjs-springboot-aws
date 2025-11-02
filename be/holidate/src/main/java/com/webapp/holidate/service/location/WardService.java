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
import com.webapp.holidate.repository.location.StreetRepository;
import com.webapp.holidate.repository.accommodation.HotelRepository;
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
  StreetRepository streetRepository;
  HotelRepository hotelRepository;

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

  public List<LocationResponse> getAll(
    String name,
    String districtId
  ) {
    boolean nameProvided = name != null && !name.isBlank();
    boolean districtIdProvided = districtId != null && !districtId.isBlank();

    if (nameProvided && districtIdProvided) {
      boolean districtExists = districtRepository.existsById(districtId);
      if (!districtExists) {
        throw new AppException(ErrorType.DISTRICT_NOT_FOUND);
      }

      return wardRepository.findAllByNameContainingIgnoreCaseAndDistrictId(name, districtId)
        .stream()
        .map(wardMapper::toLocationResponse)
        .toList();
    }

    if (nameProvided) {
      return wardRepository.findAllByNameContainingIgnoreCase(name)
        .stream()
        .map(wardMapper::toLocationResponse)
        .toList();
    }

    if (districtIdProvided) {
      boolean districtExists = districtRepository.existsById(districtId);
      if (!districtExists) {
        throw new AppException(ErrorType.DISTRICT_NOT_FOUND);
      }

      return wardRepository.findAllByDistrictId(districtId)
        .stream()
        .map(wardMapper::toLocationResponse)
        .toList();
    }

    return wardRepository.findAll()
      .stream()
      .map(wardMapper::toLocationResponse)
      .toList();
  }

  public WardResponse delete(String id) {
    Ward ward = wardRepository.findById(id)
        .orElseThrow(() -> new AppException(ErrorType.WARD_NOT_FOUND));
    
    // Check if ward has streets
    long streetCount = streetRepository.countByWardId(id);
    if (streetCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_WARD_HAS_STREETS);
    }
    
    // Check if ward has hotels
    long hotelCount = hotelRepository.countByWardId(id);
    if (hotelCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_WARD_HAS_HOTELS);
    }
    
    WardResponse response = wardMapper.toWardResponse(ward);
    wardRepository.delete(ward);
    return response;
  }
}
