package com.webapp.holidate.service.user;

import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.response.user.UserProfileResponse;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.user.UserMapper;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor()
public class UserService {
  UserRepository repository;
  UserMapper mapper;

  public List<UserProfileResponse> getAll() {
    return repository.findAll().stream().map(mapper::toUserProfileResponse).toList();
  }

  public UserProfileResponse getById(String id) {
    User user = repository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    return mapper.toUserProfileResponse(user);
  }

  public UserProfileResponse update(String id, UserUpdateRequest request) {
    User user = repository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    mapper.updateUser(user, request);
    repository.save(user);
    return mapper.toUserProfileResponse(user);
  }

  public UserProfileResponse delete(String id) {
    User user = repository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    repository.delete(user);
    return mapper.toUserProfileResponse(user);
  }
}
