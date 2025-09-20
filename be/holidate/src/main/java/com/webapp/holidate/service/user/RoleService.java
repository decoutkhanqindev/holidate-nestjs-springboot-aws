package com.webapp.holidate.service.user;

import com.webapp.holidate.dto.request.user.RoleRequest;
import com.webapp.holidate.dto.response.user.RoleResponse;
import com.webapp.holidate.entity.user.Role;
import com.webapp.holidate.mapper.RoleMapper;
import com.webapp.holidate.repository.user.RoleRepository;
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

  public RoleResponse create(RoleRequest request) {
    Role role = mapper.toEntity(request);
    repository.save(role);
    return mapper.toResponse(role);
  }

  public List<RoleResponse> getAll() {
    return repository.findAll().stream().map(mapper::toResponse).toList();
  }

  public RoleResponse delete(String id) {
    Role role = repository.findById(id).orElseThrow();
    repository.delete(role);
    return mapper.toResponse(role);
  }
}
