package com.webapp.holidate.entity.image;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.ACCOMMODATION_PHOTOS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class AccommodationPhoto {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.HOTEL_ID, nullable = true)
  @ToString.Exclude
  Hotel hotel;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.ROOM_ID, nullable = true)
  @ToString.Exclude
  Room room;

  @Column(nullable = false, columnDefinition = "TEXT")
  String url;
}