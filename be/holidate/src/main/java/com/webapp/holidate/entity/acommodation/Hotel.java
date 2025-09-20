package com.webapp.holidate.entity.acommodation;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.entity.acommodation.amenity.HotelAmenity;
import com.webapp.holidate.entity.location.City;
import com.webapp.holidate.entity.location.District;
import com.webapp.holidate.entity.booking.Review;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = DbTableNames.HOTELS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Hotel {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @Column(nullable = false)
  String name;

  @Column(nullable = false, columnDefinition = "TEXT")
  String description;

  @Column(nullable = false)
  String address;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.CITY_ID, nullable = false)
  @ToString.Exclude
  City city;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.DISTRICT_ID, nullable = false)
  @ToString.Exclude
  District district;

  @Column(nullable = true)
  @Builder.Default
  List<String> photoUrls = new ArrayList<>();

  @Column(nullable = false)
  double latitude;

  @Column(nullable = false)
  double longitude;

  @Column(nullable = false)
  Integer starRating;

  @Column(nullable = false)
  @Builder.Default
  double averageScore = 0.0;

  @Column(nullable = false)
  String checkinTime;

  @Column(nullable = false)
  String checkoutTime;

  @Column(nullable = false)
  Boolean allowsPayAtHotel;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.PARTNER_ID, nullable = false)
  @ToString.Exclude
  User partner;

  @Column(nullable = false)
  String status;

  @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  @ToString.Exclude
  @Builder.Default
  List<HotelAmenity> amenities = new ArrayList<>();

  @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @ToString.Exclude
  @Builder.Default
  List<Review> reviews = new ArrayList<>();

  @Column(nullable = false)
  @Builder.Default
  LocalDateTime createdAt = LocalDateTime.now();

  @Column(nullable = true)
  LocalDateTime updatedAt;
}