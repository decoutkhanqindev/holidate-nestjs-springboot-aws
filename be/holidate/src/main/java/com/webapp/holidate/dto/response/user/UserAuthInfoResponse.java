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
  String emailVerificationOtp;
  int emailVerificationAttempts;
  LocalDateTime emailVerificationOtpExpirationTime;
  LocalDateTime emailVerificationOtpBlockedUntil;
  String passwordResetOtp;
  int passwordResetAttempts;
  LocalDateTime passwordResetOtpExpirationTime;
  LocalDateTime passwordResetOtpBlockedUntil;
  String refreshToken;
  LocalDateTime refreshTokenExpiresAt;
  boolean active;
}
