package com.webapp.holidate.mapper.amenity;

import com.webapp.holidate.dto.request.amenity.AmenityCreationRequest;
import com.webapp.holidate.dto.response.amenity.AmenityResponse;
import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AmenityMapper {
  Amenity toEntity(AmenityCreationRequest request);

  AmenityResponse toAmenityResponse(Amenity amenity);
}
