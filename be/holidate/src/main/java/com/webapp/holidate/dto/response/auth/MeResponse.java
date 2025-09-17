package com.webapp.holidate.dto.response.auth;

import com.webapp.holidate.dto.response.user.RoleResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class MeResponse {
  String id;
  String email;
  String fullName;
  RoleResponse role;
  TokenResponse tokens;
}
