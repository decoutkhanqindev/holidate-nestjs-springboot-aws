package com.webapp.holidate.entity.accommodation;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.amenity.HotelAmenity;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.booking.Review;
import com.webapp.holidate.entity.booking.discount.HotelDiscount;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.location.*;
import com.webapp.holidate.entity.location.entertainment_venue.HotelEntertainmentVenue;
import com.webapp.holidate.entity.policy.HotelPolicy;
import com.webapp.holidate.entity.user.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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

  @Column(nullable = false, unique = true)
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
  Set<HotelEntertainmentVenue> entertainmentVenues = new HashSet<>();

  @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @ToString.Exclude
  @Builder.Default
  Set<HotelPhoto> photos = new HashSet<>();

  @Column(nullable = true)
  double latitude;

  @Column(nullable = true)
  double longitude;

  @Column(nullable = true)
  @Builder.Default
  int starRating = 0;

  @OneToOne(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
  @ToString.Exclude
  HotelPolicy policy;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.PARTNER_ID, nullable = false)
  @ToString.Exclude
  User partner;

  @Column(nullable = false)
  String status;

  @OneToMany(mappedBy = "hotel")
  @ToString.Exclude
  @Builder.Default
  Set<Room> rooms = new HashSet<>();

  @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @Builder.Default
  @ToString.Exclude
  Set<HotelAmenity> amenities = new HashSet<>();

  @Column(nullable = true)
  @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @ToString.Exclude
  @Builder.Default
  Set<Review> reviews = new HashSet<>();

  @Column(nullable = true)
  @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @ToString.Exclude
  @Builder.Default
  Set<HotelDiscount> discounts = new HashSet<>();

  @Column(nullable = false)
  @Builder.Default
  LocalDateTime createdAt = LocalDateTime.now();

  @Column(nullable = true)
  LocalDateTime updatedAt;
}