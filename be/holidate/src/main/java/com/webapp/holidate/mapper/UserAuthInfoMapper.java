package com.webapp.holidate.mapper;

import com.webapp.holidate.dto.response.user.UserAuthInfoResponse;
import com.webapp.holidate.entity.UserAuthInfo;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserAuthInfoMapper {
  UserAuthInfoResponse toResponse(UserAuthInfo authInfo);
}
