package com.webapp.holidate.component.room;

import com.webapp.holidate.entity.accommodation.room.Room;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class RoomCandidate {
  Room room;
  int availableCount;
  double basePricePerNight;
}
