package com.webapp.holidate.dto.response.acommodation.room;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

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
  LocalDateTime date;
  double discount;
  double price;
  int availableRooms;
  String status;
}