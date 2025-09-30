package com.webapp.holidate.service.amenity;

import com.webapp.holidate.dto.request.amenity.AmenityCreationRequest;
import com.webapp.holidate.dto.response.amenity.AmenityResponse;
import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.amenity.AmenityMapper;
import com.webapp.holidate.repository.amenity.AmenityRepository;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AmenityService {
  AmenityRepository repository;
  AmenityMapper mapper;

  public AmenityResponse create(AmenityCreationRequest request) {
    String name = request.getName();
    boolean exists = repository.existsByName(name);
    if (exists) {
      throw new AppException(ErrorType.AMENITY_EXISTS);
    }

    Amenity amenity = mapper.toEntity(request);
    repository.save(amenity);
    return mapper.toAmenityResponse(amenity);
  }

  public List<AmenityResponse> getAll() {
    return repository.findAll()
      .stream()
      .map(mapper::toAmenityResponse)
      .toList();
  }
}
