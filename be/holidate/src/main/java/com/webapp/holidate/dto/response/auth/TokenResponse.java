package com.webapp.holidate.dto.response.auth;

import com.webapp.holidate.dto.response.user.RoleResponse;
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
public class TokenResponse {
  String id;
  String email;
  String fullName;
  RoleResponse role;
  String accessToken;
  LocalDateTime expiresAt;
  String refreshToken;
}
