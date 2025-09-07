package com.webapp.holidate.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.Role;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class UserResponse {
  String id;
  String email;
  String fullName;
  String phoneNumber;
  String address;
  String gender;
  LocalDateTime dateOfBirth;
  String avatarUrl;
  String authProvider;
  boolean isActive;
  Set<Role> roles ;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
