package com.webapp.holidate.entity;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = DbTableNames.USERS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  @Column(nullable = false, unique = true)
  String email;

  String password;

  @Column(nullable = false)
  String fullName;

  @Column(unique = true, length = 11)
  String phoneNumber;

  String address;

  String gender;

  LocalDateTime dateOfBirth;

  String avatarUrl;

  String authProvider;

  String authProviderId;

  String emailVerificationToken;

  LocalDateTime emailVerificationTokenExpiry;

  String passwordResetToken;

  LocalDateTime passwordResetTokenExpiry;

  @Builder.Default
  boolean isActive = false;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
    name = DbTableNames.USER_ROLES,
    joinColumns = @JoinColumn(name = DbFieldNames.USER_ID),
    inverseJoinColumns = @JoinColumn(name = DbFieldNames.ROLE_ID)
  )
  @Builder.Default
  Set<Role> roles = new HashSet<>();

  @Builder.Default
  LocalDateTime createdAt = LocalDateTime.now();

  LocalDateTime updatedAt;
}

