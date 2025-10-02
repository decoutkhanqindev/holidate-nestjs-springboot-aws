package com.webapp.holidate.entity.accommodation.room;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import com.webapp.holidate.entity.image.RoomPhoto;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
  String roomNumber;

  @Column(nullable = false, columnDefinition = "TEXT")
  String description;

  @Column(nullable = false)
  double area;

  @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
  @ToString.Exclude
  @Builder.Default
  private Set<RoomPhoto> photos = new HashSet<>();

  @Column(nullable = false)
  int maxAdults;

  @Column(nullable = false)
  int maxChildren;

  @Column(nullable = false)
  double basePricePerNight;

  @Column(nullable = false)
  int quantity;

  @Column(nullable = false)
  String status;

  @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  @ToString.Exclude
  @Builder.Default
  List<RoomInventory> inventories = new ArrayList<>();

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
    name = DbTableNames.ROOM_AMENITIES,
    joinColumns = @JoinColumn(name = DbFieldNames.ROOM_ID),
    inverseJoinColumns = @JoinColumn(name = DbFieldNames.AMENITY_ID)
  )
  @Builder.Default
  @ToString.Exclude
  List<Amenity> amenities = new ArrayList<>();

  @Column(nullable = false)
  @Builder.Default
  LocalDateTime createdAt = LocalDateTime.now();

  @Column(nullable = true)
  LocalDateTime updatedAt;
}