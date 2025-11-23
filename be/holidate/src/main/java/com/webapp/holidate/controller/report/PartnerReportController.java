package com.webapp.holidate.controller.report;

import com.webapp.holidate.constants.api.endpoint.ReportEndpoints;
import com.webapp.holidate.constants.api.param.HotelParams;
import com.webapp.holidate.constants.api.param.ReportParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.service.report.PartnerReportService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping(ReportEndpoints.PARTNER_REPORTS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PartnerReportController {

  PartnerReportService partnerReportService;

  @GetMapping(ReportEndpoints.REVENUE)
  public ApiResponse<?> getRevenueReport(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.GROUP_BY, required = false, defaultValue = "day") String groupBy,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    if (compareFrom != null && compareTo != null) {
      return ApiResponse.builder()
          .data(partnerReportService.getRevenueReportWithComparison(hotelId, from, to, groupBy, compareFrom, compareTo))
          .build();
    }
    return ApiResponse.builder()
        .data(partnerReportService.getRevenueReport(hotelId, from, to, groupBy))
        .build();
  }

  @GetMapping(ReportEndpoints.BOOKINGS_SUMMARY)
  public ApiResponse<?> getBookingSummary(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    if (compareFrom != null && compareTo != null) {
      return ApiResponse.builder()
          .data(partnerReportService.getBookingSummaryWithComparison(hotelId, from, to, compareFrom, compareTo))
          .build();
    }
    return ApiResponse.builder()
        .data(partnerReportService.getBookingSummary(hotelId, from, to))
        .build();
  }

  @GetMapping(ReportEndpoints.OCCUPANCY)
  public ApiResponse<?> getOccupancyReport(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    if (compareFrom != null && compareTo != null) {
      return ApiResponse.builder()
          .data(partnerReportService.getOccupancyReportWithComparison(hotelId, from, to, compareFrom, compareTo))
          .build();
    }
    return ApiResponse.builder()
        .data(partnerReportService.getOccupancyReport(hotelId, from, to))
        .build();
  }

  @GetMapping(ReportEndpoints.ROOMS_PERFORMANCE)
  public ApiResponse<?> getRoomPerformance(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = SortingParams.SORT_BY, required = false, defaultValue = "revenue") String sortBy,
      @RequestParam(name = SortingParams.SORT_DIR, required = false, defaultValue = SortingParams.SORT_DIR_DESC) String sortOrder,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    if (compareFrom != null && compareTo != null) {
      return ApiResponse.builder()
          .data(partnerReportService.getRoomPerformanceWithComparison(hotelId, from, to, sortBy, sortOrder, compareFrom,
              compareTo))
          .build();
    }
    return ApiResponse.builder()
        .data(partnerReportService.getRoomPerformance(hotelId, from, to, sortBy, sortOrder))
        .build();
  }

  @GetMapping(ReportEndpoints.CUSTOMERS_SUMMARY)
  public ApiResponse<?> getCustomerSummary(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    if (compareFrom != null && compareTo != null) {
      return ApiResponse.builder()
          .data(partnerReportService.getCustomerSummaryWithComparison(hotelId, from, to, compareFrom, compareTo))
          .build();
    }
    return ApiResponse.builder()
        .data(partnerReportService.getCustomerSummary(hotelId, from, to))
        .build();
  }

  @GetMapping(ReportEndpoints.REVIEWS_SUMMARY)
  public ApiResponse<?> getReviewSummary(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    if (compareFrom != null && compareTo != null) {
      return ApiResponse.builder()
          .data(partnerReportService.getReviewSummaryWithComparison(hotelId, from, to, compareFrom, compareTo))
          .build();
    }
    return ApiResponse.builder()
        .data(partnerReportService.getReviewSummary(hotelId, from, to))
        .build();
  }

  /**
   * Generate daily reports for all dates in the system.
   * This endpoint processes all historical data similar to the background job,
   * but for all dates instead of just yesterday.
   * 
   * @return Summary of the operation including total dates processed, success and failure counts
   */
  @PostMapping(ReportEndpoints.GENERATE_ALL)
  public ApiResponse<?> generateAllDailyReports() {
    return ApiResponse.builder()
        .data(partnerReportService.generateAllDailyReports())
        .build();
  }
}
