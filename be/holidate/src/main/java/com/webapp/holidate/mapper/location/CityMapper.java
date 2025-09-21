package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.CityCreationRequest;
import com.webapp.holidate.dto.response.location.CityDetailsResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.City;
import com.webapp.holidate.entity.location.Country;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CityMapper {
  @Mapping(target  = "id", ignore = true)
  City toEntity(CityCreationRequest request);
  CityDetailsResponse toCityDetailsResponse(City city);
  LocationResponse toLocationResponse(Country country);
}
