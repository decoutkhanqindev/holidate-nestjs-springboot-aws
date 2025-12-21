package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.street.StreetCreationRequest;
import com.webapp.holidate.dto.request.location.street.StreetUpdateRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.StreetResponse;
import com.webapp.holidate.entity.location.Street;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StreetMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "ward", ignore = true)
  @Mapping(target = "hotels", ignore = true)
  Street toEntity(StreetCreationRequest request);

  StreetResponse toStreetResponse(Street street);

  LocationResponse toLocationResponse(Street street);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "ward", ignore = true)
  @Mapping(target = "hotels", ignore = true)
  void updateEntity(@MappingTarget Street street, StreetUpdateRequest request);
}
