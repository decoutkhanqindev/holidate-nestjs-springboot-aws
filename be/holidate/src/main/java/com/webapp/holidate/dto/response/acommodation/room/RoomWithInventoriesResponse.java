package com.webapp.holidate.dto.response.acommodation.room;

import com.webapp.holidate.dto.response.acommodation.room.inventory.RoomInventoryResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class RoomWithInventoriesResponse {
  String id;
  String name;
  String view;
  double area;
  int maxAdults;
  int maxChildren;
  double basePricePerNight;
  BedTypeResponse bedType;
  boolean smokingAllowed;
  boolean wifiAvailable;
  boolean breakfastIncluded;
  int quantity;
  String status;
  List<RoomInventoryResponse> inventories;
}