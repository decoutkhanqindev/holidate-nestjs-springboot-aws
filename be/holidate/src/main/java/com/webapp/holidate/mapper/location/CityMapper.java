package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.city.CityCreationRequest;
import com.webapp.holidate.dto.request.location.city.CityUpdateRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.City;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CityMapper {
  City toEntity(CityCreationRequest request);

  LocationResponse toLocationResponse(City city);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "provinces", ignore = true)
  @Mapping(target = "hotels", ignore = true)
  void updateEntity(@MappingTarget City City, CityUpdateRequest request);
}