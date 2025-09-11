package com.webapp.holidate.dto.response.user;

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
public class UserAuthInfoResponse {
  String id;
  String authProvider;
  String authProviderId;
  String emailVerificationToken;
  LocalDateTime emailVerificationTokenExpiry;
  String passwordResetToken;
  LocalDateTime passwordResetTokenExpiry;
  boolean active;
}
