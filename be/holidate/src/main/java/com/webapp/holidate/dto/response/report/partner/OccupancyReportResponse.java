package com.webapp.holidate.dto.response.report.partner;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
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
public class OccupancyReportResponse {
  List<OccupancyDataPoint> data;
  OccupancySummary summary;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class OccupancyDataPoint {
    LocalDate date;
    @Builder.Default
    Double occupancyRate = 0.0;
  }

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class OccupancySummary {
    @Builder.Default
    Double averageRate = 0.0;

    @Builder.Default
    Long totalOccupied = 0L;

    @Builder.Default
    Long totalAvailable = 0L;
  }
}

