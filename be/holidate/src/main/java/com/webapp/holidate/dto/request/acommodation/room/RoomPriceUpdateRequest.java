package com.webapp.holidate.dto.request.acommodation.room;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class RoomPriceUpdateRequest {
  String roomId;
  LocalDate startDate;
  LocalDate endDate;
  double price;
}
