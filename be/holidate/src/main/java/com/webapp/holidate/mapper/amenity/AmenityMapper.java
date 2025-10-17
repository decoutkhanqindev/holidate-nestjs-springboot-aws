package com.webapp.holidate.mapper.amenity;

import com.webapp.holidate.dto.request.amenity.AmenityCreationRequest;
import com.webapp.holidate.dto.response.amenity.AmenityDetailsResponse;
import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AmenityMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "category", ignore = true)
  Amenity toEntity(AmenityCreationRequest request);

  @Mapping(source = "category.id", target = "categoryId")
  AmenityDetailsResponse toAmenityDetailsResponse(Amenity amenity);
}
