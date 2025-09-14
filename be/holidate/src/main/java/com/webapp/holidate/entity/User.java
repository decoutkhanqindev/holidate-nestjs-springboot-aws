package com.webapp.holidate.entity;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

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
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = DbFieldNames.ROLE_ID)
  Role role;
  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
  UserAuthInfo authInfo;
  @Builder.Default
  LocalDateTime createdAt = LocalDateTime.now();
  LocalDateTime updatedAt;
}