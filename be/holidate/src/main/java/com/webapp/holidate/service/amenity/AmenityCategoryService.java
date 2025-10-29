package com.webapp.holidate.service.amenity;

import com.webapp.holidate.dto.request.amenity.AmenityCategoryCreationRequest;
import com.webapp.holidate.dto.response.amenity.AmenityCategoryDetailsResponse;
import com.webapp.holidate.dto.response.amenity.AmenityCategoryResponse;
import com.webapp.holidate.entity.amenity.AmenityCategory;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.amenity.AmenityCategoryMapper;
import com.webapp.holidate.repository.amenity.AmenityCategoryRepository;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AmenityCategoryService {
  AmenityCategoryRepository repository;
  AmenityCategoryMapper mapper;

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

  public List<AmenityCategoryResponse> getAll() {
    return repository.findAll()
      .stream()
      .map(mapper::toAmenityCategoryResponse)
      .toList();
  }
}
