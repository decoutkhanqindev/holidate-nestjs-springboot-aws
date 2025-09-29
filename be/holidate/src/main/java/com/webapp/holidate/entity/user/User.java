package com.webapp.holidate.entity.user;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.booking.Review;
import com.webapp.holidate.entity.location.*;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
  @Column(nullable = false)
  String id;

  @Column(nullable = false, unique = true)
  String email;

  @Column(nullable = false)
  String password;

  @Column(nullable = false)
  String fullName;

  @Column(nullable = true, unique = true, length = 11)
  String phoneNumber;

  @Column(nullable = true)
  String address;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = DbFieldNames.COUNTRY_ID, nullable = true)
  @ToString.Exclude
  Country country;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = DbFieldNames.PROVINCE_ID, nullable = true)
  @ToString.Exclude
  Province province;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = DbFieldNames.CITY_ID, nullable = true)
  @ToString.Exclude
  City city;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = DbFieldNames.DISTRICT_ID, nullable = true)
  @ToString.Exclude
  District district;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = DbFieldNames.WARD_ID, nullable = true)
  @ToString.Exclude
  Ward ward;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = DbFieldNames.STREET_ID, nullable = true)
  @ToString.Exclude
  Street street;

  @Column(nullable = true)
  String gender;

  @Column(nullable = true)
  LocalDateTime dateOfBirth;

  @Column(nullable = true)
  String avatarUrl;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = DbFieldNames.ROLE_ID, nullable = false)
  Role role;

  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
  @ToString.Exclude
  UserAuthInfo authInfo;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @ToString.Exclude
  @Builder.Default
  Set<Review> reviews = new HashSet<>();

  @Builder.Default
  @Column(nullable = false)
  LocalDateTime createdAt = LocalDateTime.now();

  @Column(nullable = true)
  LocalDateTime updatedAt;
}