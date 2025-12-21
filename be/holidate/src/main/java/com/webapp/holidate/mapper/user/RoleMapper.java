package com.webapp.holidate.mapper.user;

import com.webapp.holidate.dto.request.user.RoleCreationRequest;
import com.webapp.holidate.dto.response.user.RoleResponse;
import com.webapp.holidate.entity.user.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
  @Mapping(target = "id", ignore = true)
  Role toEntity(RoleCreationRequest request);

  RoleResponse toRoleResponse(Role role);
}
