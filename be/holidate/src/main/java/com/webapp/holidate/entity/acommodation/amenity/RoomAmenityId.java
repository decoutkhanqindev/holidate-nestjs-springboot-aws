package com.webapp.holidate.entity.acommodation.amenity;

import com.webapp.holidate.constants.db.DbFieldNames;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Embeddable
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class RoomAmenityId implements Serializable {
  @Column(name = DbFieldNames.ROOM_ID, nullable = false)
  String roomId;

  @Column(name = DbFieldNames.AMENITY_ID, nullable = false)
  String amenityId;
}