package com.webapp.holidate.entity;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = DbTableNames.USER_AUTH_INFO)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class UserAuthInfo {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
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
  @Column(name = DbFieldNames.REFRESH_TOKEN, columnDefinition = "TEXT")
  String refreshToken;
  boolean active;
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.USER_ID, nullable = false, unique = true)
  @ToString.Exclude
  User user;
}
