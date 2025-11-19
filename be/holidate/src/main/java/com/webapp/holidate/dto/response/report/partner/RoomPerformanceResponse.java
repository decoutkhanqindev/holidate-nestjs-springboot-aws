package com.webapp.holidate.dto.response.report.partner;

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
public class RoomPerformanceResponse {
  List<RoomPerformanceItem> data;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class RoomPerformanceItem {
    String roomId;
    String roomName;
    String roomView;
    @Builder.Default
    Double totalRevenue = 0.0;
    @Builder.Default
    Long totalBookedNights = 0L;
  }
}

