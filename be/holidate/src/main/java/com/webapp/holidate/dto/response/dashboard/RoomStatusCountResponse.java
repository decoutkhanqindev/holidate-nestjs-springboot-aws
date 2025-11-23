package com.webapp.holidate.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RoomStatusCountResponse {
  /**
   * Room status (e.g., "active", "inactive", "maintenance", "closed")
   */
  String status;
  
  /**
   * Total number of rooms with this status
   */
  @Builder.Default
  long count = 0;
}

