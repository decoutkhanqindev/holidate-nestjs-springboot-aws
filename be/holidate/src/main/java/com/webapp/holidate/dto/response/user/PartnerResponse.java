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
public class PartnerResponse {
  String id;
  String email;
  String fullName;
  RoleResponse role;
}
