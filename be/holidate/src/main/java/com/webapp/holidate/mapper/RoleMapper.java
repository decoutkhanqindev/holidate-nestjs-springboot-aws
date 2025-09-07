package com.webapp.holidate.mapper;

import com.webapp.holidate.dto.request.RoleRequest;
import com.webapp.holidate.dto.response.RoleResponse;
import com.webapp.holidate.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
  @Mapping(target  = "id", ignore = true)
  Role toEntity(RoleRequest request);
  RoleResponse toResponse(Role role);
}
