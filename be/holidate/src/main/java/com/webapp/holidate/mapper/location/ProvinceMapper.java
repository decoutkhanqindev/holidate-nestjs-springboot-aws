package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.province.ProvinceCreationRequest;
import com.webapp.holidate.dto.request.location.province.ProvinceUpdateRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.ProvinceResponse;
import com.webapp.holidate.entity.location.Province;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {
  Province toEntity(ProvinceCreationRequest request);

  ProvinceResponse toProvinceResponse(Province province);

  LocationResponse toLocationResponse(Province province);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "cities", ignore = true)
  @Mapping(target = "country", ignore = true)
  void updateEntity(@MappingTarget Province Province, ProvinceUpdateRequest request);
}