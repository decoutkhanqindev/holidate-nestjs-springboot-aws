package com.webapp.holidate.dto.response.user;

import com.webapp.holidate.dto.response.location.LocationResponse;
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
public class UserResponse {
  String id;
  String email;
  String fullName;
  String phoneNumber;
  String address;
  LocationResponse country;
  LocationResponse province;
  LocationResponse city;
  LocationResponse district;
  LocationResponse ward;
  LocationResponse street;
  String gender;
  LocalDateTime dateOfBirth;
  String avatarUrl;
  RoleResponse role;
  UserAuthInfoResponse authInfo;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
