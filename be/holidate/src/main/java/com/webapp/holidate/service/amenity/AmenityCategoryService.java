package com.webapp.holidate.service.amenity;

import com.webapp.holidate.dto.request.amenity.AmenityCategoryCreationRequest;
import com.webapp.holidate.dto.response.amenity.AmenityCategoryDetailsResponse;
import com.webapp.holidate.dto.response.amenity.AmenityCategoryResponse;
import com.webapp.holidate.entity.amenity.AmenityCategory;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.amenity.AmenityCategoryMapper;
import com.webapp.holidate.repository.amenity.AmenityCategoryRepository;
import com.webapp.holidate.repository.amenity.AmenityRepository;
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
public class AmenityCategoryService {
  AmenityCategoryRepository repository;
  AmenityCategoryMapper mapper;
  AmenityRepository amenityRepository;

  public AmenityCategoryDetailsResponse create(AmenityCategoryCreationRequest request) {
    String name = request.getName();
    boolean exists = repository.existsByName(name);
    if (exists) {
      throw new AppException(ErrorType.AMENITY_CATEGORY_EXISTS);
    }

    AmenityCategory category = mapper.toEntity(request);
    repository.save(category);
    return mapper.toAmenityCategoryDetailsResponse(category);
  }

  @Transactional(readOnly = true)
  public List<AmenityCategoryResponse> getAll() {
    return repository.findAll()
      .stream()
      .map(mapper::toAmenityCategoryResponse)
      .toList();
  }

  public AmenityCategoryDetailsResponse delete(String id) {
    AmenityCategory category = repository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.AMENITY_CATEGORY_NOT_FOUND));

    // Check if category has amenities (though cascade will handle, we check for business logic)
    long amenityCount = amenityRepository.countByCategoryId(id);
    if (amenityCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_AMENITY_CATEGORY_HAS_AMENITIES);
    }

    AmenityCategoryDetailsResponse response = mapper.toAmenityCategoryDetailsResponse(category);
    repository.delete(category);
    return response;
  }
}
