package com.webapp.holidate.dto.response.report.admin;

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
public class HotelPerformanceReportResponse {
  List<HotelPerformanceItem> data;
  int page;
  int size;
  long totalItems;
  int totalPages;
  boolean first;
  boolean last;
  boolean hasNext;
  boolean hasPrevious;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class HotelPerformanceItem {
    String hotelId;
    String hotelName;
    Double totalRevenue;
    Long totalCompletedBookings;
    Long totalCreatedBookings;
    Long totalCancelledBookings;
    Double averageOccupancyRate;
    Double cancellationRate;
  }
}

