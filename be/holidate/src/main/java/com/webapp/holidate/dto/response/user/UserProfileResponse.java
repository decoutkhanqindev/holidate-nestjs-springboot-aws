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
public class UserProfileResponse {
  String id;
  String email;
  String fullName;
  String phoneNumber;
  String address;
  LocationResponse city;
  LocationResponse district;
  LocationResponse province;
  LocationResponse country;
  String gender;
  LocalDateTime dateOfBirth;
  String avatarUrl;
  RoleDetailsResponse role;
  UserAuthInfoResponse authInfo;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
