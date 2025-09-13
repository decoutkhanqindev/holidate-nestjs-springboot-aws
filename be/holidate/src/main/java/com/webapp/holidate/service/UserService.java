package com.webapp.holidate.service;

import com.webapp.holidate.dto.request.user.UserCreationRequest;
import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.response.user.UserResponse;
import com.webapp.holidate.entity.Role;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.entity.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.UserMapper;
import com.webapp.holidate.repository.RoleRepository;
import com.webapp.holidate.repository.UserAuthInfoRepository;
import com.webapp.holidate.repository.UserRepository;
import com.webapp.holidate.type.AuthProviderType;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.RoleType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor()
public class UserService {
  UserRepository userRepository;
  UserAuthInfoRepository authInfoRepository;
  RoleRepository roleRepository;
  UserMapper mapper;
  PasswordEncoder passwordEncoder;

  public UserResponse create(UserCreationRequest request) {
    UserAuthInfo authInfo = authInfoRepository.findByUserEmail(request.getEmail()).orElse(null);

    if (authInfo != null && authInfo.isActive()) {
      throw new AppException(ErrorType.USER_EXISTS);
    }

    if (authInfo != null) {
      authInfoRepository.delete(authInfo);
      userRepository.deleteById(authInfo.getUser().getId());
    }

    User user = mapper.toEntity(request);

    String encodedPassword = passwordEncoder.encode(request.getPassword());
    user.setPassword(encodedPassword);

    Role role = roleRepository.findByName(RoleType.USER.name());
    user.setRole(role);

    UserAuthInfo newAuthInfo = UserAuthInfo.builder()
      .authProvider(AuthProviderType.LOCAL.getValue())
      .emailVerificationAttempts(0)
      .active(false)
      .user(user)
      .build();
    user.setAuthInfo(newAuthInfo);

    userRepository.save(user);
    return mapper.toResponse(user);
  }

  public List<UserResponse> getAll() {
    return userRepository.findAll().stream().map(mapper::toResponse).toList();
  }

  public UserResponse getById(String id) {
    User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    return mapper.toResponse(user);
  }

  public UserResponse update(String id, UserUpdateRequest request) {
    User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    mapper.updateUser(user, request);
    userRepository.save(user);
    return mapper.toResponse(user);
  }

  public UserResponse delete(String id) {
    User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    userRepository.delete(user);
    return mapper.toResponse(user);
  }
}
