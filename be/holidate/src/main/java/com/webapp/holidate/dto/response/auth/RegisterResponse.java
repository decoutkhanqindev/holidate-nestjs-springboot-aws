package com.webapp.holidate.dto.response.auth;

import com.webapp.holidate.dto.response.user.RoleResponse;
import com.webapp.holidate.dto.response.user.UserAuthInfoResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class RegisterResponse {
  String id;
  String email;
  String fullName;
  String phoneNumber;
  String address;
  String gender;
  LocalDateTime dateOfBirth;
  String avatarUrl;
  RoleResponse role;
  UserAuthInfoResponse authInfo;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
