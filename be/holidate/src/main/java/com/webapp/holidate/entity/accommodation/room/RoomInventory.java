package com.webapp.holidate.entity.accommodation.room;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.ROOM_INVENTORIES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class RoomInventory {
  @EmbeddedId
  RoomInventoryId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId(DbFieldNames.ROOM_ID_CAMEL)
  @JoinColumn(name = DbFieldNames.ROOM_ID, nullable = false)
  @ToString.Exclude
  Room room;

  @Column(nullable = false)
  double discount;

  @Column(nullable = false)
  double price;

  @Column(nullable = false)
  int availableRooms;

  @Column(nullable = false)
  String status;
}