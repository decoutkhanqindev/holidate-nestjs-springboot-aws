package com.webapp.holidate.dto.response;

import com.webapp.holidate.entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
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
