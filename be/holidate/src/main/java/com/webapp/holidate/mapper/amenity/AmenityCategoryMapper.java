package com.webapp.holidate.mapper.amenity;

import com.webapp.holidate.dto.request.amenity.AmenityCategoryCreationRequest;
import com.webapp.holidate.dto.response.amenity.AmenityCategoryResponse;
import com.webapp.holidate.entity.accommodation.amenity.AmenityCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AmenityCategoryMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "amenities", ignore = true)
  AmenityCategory toEntity(AmenityCategoryCreationRequest request);

  AmenityCategoryResponse toAmenityCategoryResponse(AmenityCategory amenityCategory);
}
