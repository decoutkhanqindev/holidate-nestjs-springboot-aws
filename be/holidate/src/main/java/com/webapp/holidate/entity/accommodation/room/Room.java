package com.webapp.holidate.entity.accommodation.room;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.amenity.RoomAmenity;
import com.webapp.holidate.entity.image.RoomPhoto;
import com.webapp.holidate.entity.policy.cancelation.CancellationPolicy;
import com.webapp.holidate.entity.policy.reschedule.ReschedulePolicy;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = DbTableNames.ROOMS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Room {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.HOTEL_ID, nullable = false)
  @ToString.Exclude
  Hotel hotel;

  @Column(nullable = false)
  String name;

  @Column(nullable = false)
  String view;

  @Column(nullable = false)
  double area;

  @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
  @ToString.Exclude
  @Builder.Default
  Set<RoomPhoto> photos = new HashSet<>();

  @Column(nullable = false)
  int maxAdults;

  @Column(nullable = false)
  int maxChildren;

  @Column(nullable = false)
  double basePricePerNight;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.BED_TYPE_ID, nullable = false)
  @ToString.Exclude
  BedType bedType;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.CANCELLATION_POLICY_ID, nullable = true)
  @ToString.Exclude
  CancellationPolicy cancellationPolicy;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.RESCHEDULE_POLICY_ID, nullable = true)
  @ToString.Exclude
  ReschedulePolicy reschedulePolicy;

  @Column(nullable = false)
  boolean smokingAllowed;

  @Column(nullable = false)
  boolean wifiAvailable;

  @Column(nullable = false)
  boolean breakfastIncluded;

  @Column(nullable = false)
  int quantity;

  @Column(nullable = false)
  String status;

  @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  @ToString.Exclude
  @Builder.Default
  Set<RoomInventory> inventories = new HashSet<>();

  @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @Builder.Default
  @ToString.Exclude
  Set<RoomAmenity> amenities = new HashSet<>();

  @Column(nullable = false)
  @Builder.Default
  LocalDateTime createdAt = LocalDateTime.now();

  @Column(nullable = true)
  LocalDateTime updatedAt;
}