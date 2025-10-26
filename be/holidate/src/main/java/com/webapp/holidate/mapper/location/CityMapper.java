package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.city.CityCreationRequest;
import com.webapp.holidate.dto.request.location.city.CityUpdateRequest;
import com.webapp.holidate.dto.response.location.CityResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.City;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CityMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "province", ignore = true)
  @Mapping(target = "districts", ignore = true)
  @Mapping(target = "hotels", ignore = true)
  City toEntity(CityCreationRequest request);

  CityResponse toCityResponse(City city);

  LocationResponse toLocationResponse(City city);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "province", ignore = true)
  @Mapping(target = "districts", ignore = true)
  @Mapping(target = "hotels", ignore = true)
  void updateEntity(@MappingTarget City City, CityUpdateRequest request);
}