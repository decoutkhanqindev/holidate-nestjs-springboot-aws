package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.ward.WardCreationRequest;
import com.webapp.holidate.dto.request.location.ward.WardUpdateRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.WardResponse;
import com.webapp.holidate.entity.location.Ward;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface WardMapper {
  Ward toEntity(WardCreationRequest request);

  WardResponse toWardResponse(Ward ward);

  LocationResponse toLocationResponse(Ward ward);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "district", ignore = true)
  @Mapping(target = "streets", ignore = true)
  @Mapping(target = "hotels", ignore = true)
  void updateEntity(@MappingTarget Ward ward, WardUpdateRequest request);
}
