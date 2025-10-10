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
public class RoomInventoryResponse {
  String roomId;
  LocalDate date;
  double price;
  int availableRooms;
  String status;
}