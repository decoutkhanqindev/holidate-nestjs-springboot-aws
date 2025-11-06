package com.webapp.holidate.service.location;

import com.webapp.holidate.dto.request.location.street.StreetCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.StreetResponse;
import com.webapp.holidate.entity.location.Street;
import com.webapp.holidate.entity.location.Ward;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.location.StreetMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
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
  HotelRepository hotelRepository;

  public StreetResponse create(StreetCreationRequest request) {
    String name = request.getName();
    String code = request.getCode();
    String wardId = request.getWardId();

    // Check if ward exists and fetch it
    Ward ward = wardRepository.findById(wardId)
        .orElseThrow(() -> new AppException(ErrorType.WARD_NOT_FOUND));

    // Check if street with same name exists in this ward
    boolean nameExistsInWard = streetRepository.existsByNameAndWardId(name, wardId);
    if (nameExistsInWard) {
      throw new AppException(ErrorType.STREET_EXISTS);
    }

    // Check if street with same code exists in this ward
    boolean codeExistsInWard = streetRepository.existsByCodeAndWardId(code, wardId);
    if (codeExistsInWard) {
      throw new AppException(ErrorType.STREET_EXISTS);
    }

    Street street = streetMapper.toEntity(request);
    street.setWard(ward);

    streetRepository.save(street);
    return streetMapper.toStreetResponse(street);
  }

  public List<LocationResponse> getAll(
      String name,
      String wardId) {
    boolean nameProvided = name != null && !name.isBlank();
    boolean wardIdProvided = wardId != null && !wardId.isBlank();

    if (nameProvided && wardIdProvided) {
      boolean wardExists = wardRepository.existsById(wardId);
      if (!wardExists) {
        throw new AppException(ErrorType.WARD_NOT_FOUND);
      }

      return streetRepository.findAllByNameContainingIgnoreCaseAndWardId(name, wardId)
          .stream()
          .map(streetMapper::toLocationResponse)
          .toList();
    }

    if (nameProvided) {
      return streetRepository.findAllByNameContainingIgnoreCase(name)
          .stream()
          .map(streetMapper::toLocationResponse)
          .toList();
    }

    if (wardIdProvided) {
      boolean wardExists = wardRepository.existsById(wardId);
      if (!wardExists) {
        throw new AppException(ErrorType.WARD_NOT_FOUND);
      }

      return streetRepository.findAllByWardId(wardId)
          .stream()
          .map(streetMapper::toLocationResponse)
          .toList();
    }

    return streetRepository.findAll()
        .stream()
        .map(streetMapper::toLocationResponse)
        .toList();
  }

  public StreetResponse delete(String id) {
    Street street = streetRepository.findById(id)
        .orElseThrow(() -> new AppException(ErrorType.STREET_NOT_FOUND));

    // Check if street has hotels
    long hotelCount = hotelRepository.countByStreetId(id);
    if (hotelCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_STREET_HAS_HOTELS);
    }

    StreetResponse response = streetMapper.toStreetResponse(street);
    streetRepository.delete(street);
    return response;
  }
}
