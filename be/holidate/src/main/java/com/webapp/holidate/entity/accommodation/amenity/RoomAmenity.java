package com.webapp.holidate.entity.accommodation.amenity;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.room.Room;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.ROOM_AMENITIES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class RoomAmenity {
  @EmbeddedId
  RoomAmenityId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId(DbFieldNames.ROOM_ID_CAMEL)
  @JoinColumn(name = DbFieldNames.ROOM_ID, nullable = false)
  @ToString.Exclude
  Room room;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId(DbFieldNames.AMENITY_ID_CAMEL)
  @JoinColumn(name = DbFieldNames.AMENITY_ID, nullable = false)
  @ToString.Exclude
  Amenity amenity;
}