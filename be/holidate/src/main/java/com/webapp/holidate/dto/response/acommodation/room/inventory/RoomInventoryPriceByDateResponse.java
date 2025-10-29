package com.webapp.holidate.dto.response.acommodation.room.inventory;

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
public class RoomInventoryPriceByDateResponse {
  LocalDate date;
  double price;
}
