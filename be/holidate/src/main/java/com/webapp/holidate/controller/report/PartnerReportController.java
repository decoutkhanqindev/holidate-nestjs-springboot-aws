package com.webapp.holidate.controller.report;

import com.webapp.holidate.constants.api.endpoint.ReportEndpoints;
import com.webapp.holidate.constants.api.param.HotelParams;
import com.webapp.holidate.constants.api.param.ReportParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.report.partner.BookingsSummaryResponse;
import com.webapp.holidate.dto.response.report.partner.CustomerSummaryResponse;
import com.webapp.holidate.dto.response.report.partner.OccupancyReportResponse;
import com.webapp.holidate.dto.response.report.partner.RevenueReportResponse;
import com.webapp.holidate.dto.response.report.partner.ReviewSummaryResponse;
import com.webapp.holidate.dto.response.report.partner.RoomPerformanceResponse;
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
  public ApiResponse<Object> getRevenueReport(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.GROUP_BY, required = false, defaultValue = "day") String groupBy,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    Object response = partnerReportService.getRevenueReport(hotelId, from, to, groupBy, compareFrom, compareTo);
    return ApiResponse.<Object>builder()
        .data(response)
        .build();
  }

  @GetMapping(ReportEndpoints.BOOKINGS_SUMMARY)
  public ApiResponse<Object> getBookingSummary(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    Object response = partnerReportService.getBookingSummary(hotelId, from, to, compareFrom, compareTo);
    return ApiResponse.<Object>builder()
        .data(response)
        .build();
  }

  @GetMapping(ReportEndpoints.OCCUPANCY)
  public ApiResponse<Object> getOccupancyReport(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    Object response = partnerReportService.getOccupancyReport(hotelId, from, to, compareFrom, compareTo);
    return ApiResponse.<Object>builder()
        .data(response)
        .build();
  }

  @GetMapping(ReportEndpoints.ROOMS_PERFORMANCE)
  public ApiResponse<Object> getRoomPerformance(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = SortingParams.SORT_BY, required = false, defaultValue = "revenue") String sortBy,
      @RequestParam(name = SortingParams.SORT_DIR, required = false, defaultValue = SortingParams.SORT_DIR_DESC) String sortOrder,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    Object response = partnerReportService.getRoomPerformance(hotelId, from, to, sortBy, sortOrder, compareFrom,
        compareTo);
    return ApiResponse.<Object>builder()
        .data(response)
        .build();
  }

  @GetMapping(ReportEndpoints.CUSTOMERS_SUMMARY)
  public ApiResponse<Object> getCustomerSummary(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    Object response = partnerReportService.getCustomerSummary(hotelId, from, to, compareFrom, compareTo);
    return ApiResponse.<Object>builder()
        .data(response)
        .build();
  }

  @GetMapping(ReportEndpoints.REVIEWS_SUMMARY)
  public ApiResponse<Object> getReviewSummary(
      @RequestParam(name = HotelParams.HOTEL_ID) @NotBlank String hotelId,
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    Object response = partnerReportService.getReviewSummary(hotelId, from, to, compareFrom, compareTo);
    return ApiResponse.<Object>builder()
        .data(response)
        .build();
  }
}
