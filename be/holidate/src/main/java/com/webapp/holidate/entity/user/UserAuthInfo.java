package com.webapp.holidate.entity.user;

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
  @Column(nullable = false)
  String id;

  @Column(nullable = false)
  String authProvider;

  @Column(nullable = true)
  String authProviderId;

  @Column(nullable = true)
  String emailVerificationOtp;

  @Column(nullable = false)
  int emailVerificationAttempts;

  @Column(nullable = true)
  LocalDateTime emailVerificationOtpExpirationTime;

  @Column(nullable = true)
  LocalDateTime emailVerificationOtpBlockedUntil;

  @Column(nullable = true)
  String passwordResetOtp;

  @Column(nullable = false)
  int passwordResetAttempts;

  @Column(nullable = true)
  LocalDateTime passwordResetOtpExpirationTime;

  @Column(nullable = true)
  LocalDateTime passwordResetOtpBlockedUntil;

  @Column(nullable = true, columnDefinition = "TEXT")
  String refreshToken;

  @Column(nullable = false)
  boolean active;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.USER_ID, nullable = false, unique = true)
  @ToString.Exclude
  User user;
}