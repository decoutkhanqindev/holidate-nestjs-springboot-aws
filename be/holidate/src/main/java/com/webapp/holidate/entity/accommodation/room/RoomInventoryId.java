package com.webapp.holidate.entity.accommodation.room;

import com.webapp.holidate.constants.db.DbFieldNames;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDate;

@Embeddable
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class RoomInventoryId implements Serializable {
  @Column(name = DbFieldNames.ROOM_ID, nullable = false)
  String roomId;

  @Column(nullable = false)
  LocalDate date;
}