package com.webapp.holidate.service.user;

import com.webapp.holidate.dto.request.user.RoleCreationRequest;
import com.webapp.holidate.dto.response.user.RoleResponse;
import com.webapp.holidate.entity.user.Role;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.user.RoleMapper;
import com.webapp.holidate.repository.user.RoleRepository;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoleService {
  RoleRepository repository;
  RoleMapper mapper;

  public RoleResponse create(RoleCreationRequest request) {
    String name = request.getName();
    boolean exists = repository.existsByName(name);
    if (exists) {
      throw new AppException(ErrorType.ROLE_EXISTS);
    }

    Role role = mapper.toEntity(request);
    repository.save(role);
    return mapper.toRoleResponse(role);
  }

  public List<RoleResponse> getAll() {
    return repository.findAll().stream().map(mapper::toRoleResponse).toList();
  }

  public RoleResponse delete(String id) {
    Role role = repository.findById(id).orElseThrow();
    repository.delete(role);
    return mapper.toRoleResponse(role);
  }
}
