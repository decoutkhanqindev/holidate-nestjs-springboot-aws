package com.webapp.holidate.mapper.amenity;

import com.webapp.holidate.dto.request.amenity.AmenityCreationRequest;
import com.webapp.holidate.dto.response.amenity.AmenityResponse;
import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AmenityMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "category", ignore = true)
  Amenity toEntity(AmenityCreationRequest request);

  AmenityResponse toAmenityResponse(Amenity amenity);
}
