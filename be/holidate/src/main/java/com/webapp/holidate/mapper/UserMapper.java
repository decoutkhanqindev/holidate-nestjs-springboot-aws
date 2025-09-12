package com.webapp.holidate.mapper;

import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.request.user.UserCreationRequest;
import com.webapp.holidate.dto.response.user.UserResponse;
import com.webapp.holidate.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
  User toEntity(UserCreationRequest request);
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
