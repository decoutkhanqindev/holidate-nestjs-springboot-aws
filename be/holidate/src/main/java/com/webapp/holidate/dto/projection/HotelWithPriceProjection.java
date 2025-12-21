package com.webapp.holidate.dto.projection;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Projection DTO for Hotel with aggregated price and availability data.
 * Used to avoid loading all room inventories into memory when fetching hotel lists.
 * Database calculates prices and availability using aggregation queries.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HotelWithPriceProjection {
  String hotelId;
  Double rawPricePerNight;      // MIN(room.basePricePerNight) - lowest base price
  Double currentPricePerNight;  // MIN(inventory.price WHERE date >= today AND availableRooms > 0)
  Integer availableRooms;       // SUM(inventory.availableRooms WHERE date = today)
}

