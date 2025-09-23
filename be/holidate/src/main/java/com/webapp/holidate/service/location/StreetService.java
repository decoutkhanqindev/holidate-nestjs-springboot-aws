package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.street.StreetCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.StreetResponse;
import com.webapp.holidate.entity.location.Street;
import com.webapp.holidate.entity.location.Ward;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.StreetMapper;
import com.webapp.holidate.repository.location.StreetRepository;
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
public class StreetService {
  StreetRepository streetRepository;
  WardRepository wardRepository;
  StreetMapper streetMapper;

  public StreetResponse create(StreetCreationRequest request) {
    String name = request.getName();
    boolean nameExists = streetRepository.existsByName(name);
    if (nameExists) {
      throw new AppException(ErrorType.STREET_EXISTS);
    }

    String code = request.getCode();
    boolean codeExists = streetRepository.existsByCode(code);
    if (codeExists) {
      throw new AppException(ErrorType.STREET_EXISTS);
    }

    String wardId = request.getWardId();
    boolean wardExists = streetRepository.existsByWardId(wardId);
    if (wardExists) {
      throw new AppException(ErrorType.STREET_EXISTS);
    }

    Street street = streetMapper.toEntity(request);

    Ward ward = wardRepository.findById(wardId)
        .orElseThrow(() -> new AppException(ErrorType.WARD_NOT_FOUND));
    street.setWard(ward);

    streetRepository.save(street);
    return streetMapper.toStreetResponse(street);
  }

  public List<LocationResponse> getAll() {
    return streetRepository.findAll().stream().map(streetMapper::toLocationResponse).toList();
  }
}
