package com.webapp.holidate.dto.response;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
  @Builder.Default
  boolean isActive = false;
}
