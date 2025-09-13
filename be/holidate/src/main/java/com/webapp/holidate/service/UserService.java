package com.webapp.holidate.service;

import com.webapp.holidate.dto.request.user.UserUpdateRequest;
import com.webapp.holidate.dto.response.auth.RegisterResponse;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.UserMapper;
import com.webapp.holidate.repository.UserRepository;
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

  public List<RegisterResponse> getAll() {
    return repository.findAll().stream().map(mapper::toRegisterResponse).toList();
  }

  public RegisterResponse getById(String id) {
    User user = repository.findById(id).orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    return mapper.toRegisterResponse(user);
  }

  public RegisterResponse update(String id, UserUpdateRequest request) {
    User user = repository.findById(id).orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    mapper.updateUser(user, request);
    repository.save(user);
    return mapper.toRegisterResponse(user);
  }

  public RegisterResponse delete(String id) {
    User user = repository.findById(id).orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    repository.delete(user);
    return mapper.toRegisterResponse(user);
  }
}
