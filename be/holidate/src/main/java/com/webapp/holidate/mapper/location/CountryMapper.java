package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.CountryCreationRequest;
import com.webapp.holidate.dto.response.location.CountryDetailsResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.Country;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CountryMapper {
  @Mapping(target  = "id", ignore = true)
  Country toEntity(CountryCreationRequest request);
  CountryDetailsResponse toCountryDetailsResponse(Country country);
  LocationResponse toLocationResponse(Country country);
}
