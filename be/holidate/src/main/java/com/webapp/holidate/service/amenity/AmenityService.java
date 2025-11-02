package com.webapp.holidate.service.amenity;

import com.webapp.holidate.dto.request.amenity.AmenityCreationRequest;
import com.webapp.holidate.dto.response.amenity.AmenityDetailsResponse;
import com.webapp.holidate.entity.amenity.Amenity;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.amenity.AmenityMapper;
import com.webapp.holidate.repository.amenity.AmenityRepository;
import com.webapp.holidate.repository.amenity.HotelAmenityRepository;
import com.webapp.holidate.repository.amenity.RoomAmenityRepository;
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
  HotelAmenityRepository hotelAmenityRepository;
  RoomAmenityRepository roomAmenityRepository;

  public AmenityDetailsResponse create(AmenityCreationRequest request) {
    String name = request.getName();
    boolean exists = repository.existsByName(name);
    if (exists) {
      throw new AppException(ErrorType.AMENITY_EXISTS);
    }

    Amenity amenity = mapper.toEntity(request);
    repository.save(amenity);
    return mapper.toAmenityDetailsResponse(amenity);
  }

  public List<AmenityDetailsResponse> getAll() {
    return repository.findAllWithCategory()
      .stream()
      .map(mapper::toAmenityDetailsResponse)
      .toList();
  }

  public List<AmenityDetailsResponse> getAllByCategoryId(String categoryId) {
    return repository.findAllByCategoryId(categoryId)
      .stream()
      .map(mapper::toAmenityDetailsResponse)
      .toList();
  }

  public AmenityDetailsResponse delete(String id) {
    Amenity amenity = repository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.AMENITY_NOT_FOUND));

    // Check if amenity is referenced by hotels
    long hotelAmenityCount = hotelAmenityRepository.countByAmenityId(id);
    if (hotelAmenityCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_AMENITY_HAS_REFERENCES);
    }

    // Check if amenity is referenced by rooms
    long roomAmenityCount = roomAmenityRepository.countByAmenityId(id);
    if (roomAmenityCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_AMENITY_HAS_REFERENCES);
    }

    AmenityDetailsResponse response = mapper.toAmenityDetailsResponse(amenity);
    repository.delete(amenity);
    return response;
  }
}
