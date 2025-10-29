package com.webapp.holidate.repository.user;

import com.webapp.holidate.entity.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, String> {
  Role findByName(String name);

  boolean existsByName(String name);
}
