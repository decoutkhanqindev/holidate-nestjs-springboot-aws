package com.webapp.holidate.entity.accommodation;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.amenity.HotelAmenity;
import com.webapp.holidate.entity.booking.Review;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.location.*;
import com.webapp.holidate.entity.user.User;
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
  @JoinColumn(name = DbFieldNames.COUNTRY_ID, nullable = false)
  @ToString.Exclude
  Country country;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.PROVINCE_ID, nullable = false)
  @ToString.Exclude
  Province province;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.CITY_ID, nullable = false)
  @ToString.Exclude
  City city;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.DISTRICT_ID, nullable = false)
  @ToString.Exclude
  District district;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.WARD_ID, nullable = false)
  @ToString.Exclude
  Ward ward;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.STREET_ID, nullable = false)
  @ToString.Exclude
  Street street;

  @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @ToString.Exclude
  @Builder.Default
  List<HotelPhoto> photos = new ArrayList<>();

  @Column(nullable = true)
  double latitude;

  @Column(nullable = true)
  double longitude;

  @Column(nullable = true)
  @Builder.Default
  int starRating = 0;

  @Column(nullable = true)
  @Builder.Default
  double averageScore = 0.0;

  @Column(nullable = true)
  @Builder.Default
  boolean allowsPayAtHotel = false;

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