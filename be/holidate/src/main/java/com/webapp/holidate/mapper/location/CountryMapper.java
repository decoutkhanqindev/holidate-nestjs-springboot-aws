package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.country.CountryCreationRequest;
import com.webapp.holidate.dto.request.location.country.CountryUpdateRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.Country;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CountryMapper {
  Country toEntity(CountryCreationRequest request);

  LocationResponse toLocationResponse(Country country);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "provinces", ignore = true)
  @Mapping(target = "hotels", ignore = true)
  void updateEntity(@MappingTarget Country country, CountryUpdateRequest request);
}