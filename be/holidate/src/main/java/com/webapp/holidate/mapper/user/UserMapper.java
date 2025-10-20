package com.webapp.holidate.mapper.user;

import com.webapp.holidate.dto.request.auth.RegisterRequest;
import com.webapp.holidate.dto.request.user.UserCreationRequest;
import com.webapp.holidate.dto.response.user.UserResponse;
import com.webapp.holidate.entity.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
  User toEntity(RegisterRequest request);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "country", ignore = true)
  @Mapping(target = "province", ignore = true)
  @Mapping(target = "city", ignore = true)
  @Mapping(target = "district", ignore = true)
  @Mapping(target = "ward", ignore = true)
  @Mapping(target = "street", ignore = true)
  @Mapping(target = "role", ignore = true)
  @Mapping(target = "authInfo", ignore = true)
  @Mapping(target = "reviews", ignore = true)
  @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
  @Mapping(target = "updatedAt", ignore = true)
  User toEntity(UserCreationRequest request);

  UserResponse toUserResponse(User user);
}
