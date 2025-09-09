package com.webapp.holidate.mapper;

import com.webapp.holidate.dto.request.UserUpdateRequest;
import com.webapp.holidate.dto.request.auth.RegisterRequest;
import com.webapp.holidate.dto.response.UserResponse;
import com.webapp.holidate.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
  User toEntity(RegisterRequest request);
  UserResponse toResponse(User user);
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "email", ignore = true)
  @Mapping(target = "password", ignore = true)
  @Mapping(target = "role", ignore = true)
  @Mapping(target = "authInfo", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
  void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
