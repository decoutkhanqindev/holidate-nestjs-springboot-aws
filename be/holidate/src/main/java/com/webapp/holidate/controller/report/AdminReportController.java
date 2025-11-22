package com.webapp.holidate.controller.report;

import com.webapp.holidate.constants.api.endpoint.ReportEndpoints;
import com.webapp.holidate.constants.api.param.LocationParams;
import com.webapp.holidate.constants.api.param.PaginationParams;
import com.webapp.holidate.constants.api.param.ReportParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.service.report.AdminReportService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping(ReportEndpoints.ADMIN_REPORTS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AdminReportController {

  AdminReportService adminReportService;

  @GetMapping(ReportEndpoints.REVENUE)
  public ApiResponse<?> getRevenueReport(
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.GROUP_BY, required = false, defaultValue = "day") String groupBy,
      @RequestParam(name = ReportParams.FILTER_BY, required = false) String filterBy,
      @RequestParam(name = PaginationParams.PAGE, required = false, defaultValue = PaginationParams.DEFAULT_PAGE) @Min(0) int page,
      @RequestParam(name = PaginationParams.SIZE, required = false, defaultValue = PaginationParams.DEFAULT_SIZE) @Min(1) int size,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    // Validate comparison parameters: both must be provided or both must be null
    if ((compareFrom != null && compareTo == null) || (compareFrom == null && compareTo != null)) {
      throw new com.webapp.holidate.exception.AppException(
          com.webapp.holidate.type.ErrorType.INVALID_DATE_RANGE);
    }

    if (compareFrom != null && compareTo != null) {
      return ApiResponse.builder()
          .data(adminReportService.getRevenueReportWithComparison(
              from, to, groupBy, filterBy, compareFrom, compareTo, page, size))
          .build();
    }
    return ApiResponse.builder()
        .data(adminReportService.getRevenueReport(from, to, groupBy, filterBy, page, size))
        .build();
  }

  @GetMapping(ReportEndpoints.HOTEL_PERFORMANCE)
  public ApiResponse<?> getHotelPerformanceReport(
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = SortingParams.SORT_BY, required = false, defaultValue = "revenue") String sortBy,
      @RequestParam(name = SortingParams.SORT_DIR, required = false, defaultValue = SortingParams.SORT_DIR_DESC) String sortOrder,
      @RequestParam(name = LocationParams.CITY_ID, required = false) String cityId,
      @RequestParam(name = LocationParams.PROVINCE_ID, required = false) String provinceId,
      @RequestParam(name = PaginationParams.PAGE, required = false, defaultValue = PaginationParams.DEFAULT_PAGE) @Min(0) int page,
      @RequestParam(name = PaginationParams.SIZE, required = false, defaultValue = "20") @Min(1) int size,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    // Validate comparison parameters: both must be provided or both must be null
    if ((compareFrom != null && compareTo == null) || (compareFrom == null && compareTo != null)) {
      throw new com.webapp.holidate.exception.AppException(
          com.webapp.holidate.type.ErrorType.INVALID_DATE_RANGE);
    }

    if (compareFrom != null && compareTo != null) {
      return ApiResponse.builder()
          .data(adminReportService.getHotelPerformanceReportWithComparison(
              from, to, sortBy, sortOrder, cityId, provinceId, compareFrom, compareTo, page, size))
          .build();
    }
    return ApiResponse.builder()
        .data(adminReportService.getHotelPerformanceReport(
            from, to, sortBy, sortOrder, cityId, provinceId, page, size))
        .build();
  }

  @GetMapping(ReportEndpoints.USERS_SUMMARY)
  public ApiResponse<?> getUsersSummaryReport(
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    // Validate comparison parameters: both must be provided or both must be null
    if ((compareFrom != null && compareTo == null) || (compareFrom == null && compareTo != null)) {
      throw new com.webapp.holidate.exception.AppException(
          com.webapp.holidate.type.ErrorType.INVALID_DATE_RANGE);
    }

    if (compareFrom != null && compareTo != null) {
      return ApiResponse.builder()
          .data(adminReportService.getUsersSummaryReportWithComparison(
              from, to, compareFrom, compareTo))
          .build();
    }
    return ApiResponse.builder()
        .data(adminReportService.getUsersSummaryReport(from, to))
        .build();
  }

  @GetMapping(ReportEndpoints.TRENDS + ReportEndpoints.SEASONALITY)
  public ApiResponse<?> getSeasonalityReport(
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.METRIC, required = false, defaultValue = "bookings") String metric) {
    return ApiResponse.builder()
        .data(adminReportService.getSeasonalityReport(from, to, metric))
        .build();
  }

  @GetMapping(ReportEndpoints.TRENDS + ReportEndpoints.POPULAR_LOCATIONS)
  public ApiResponse<?> getPopularLocationsReport(
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.LEVEL, required = false, defaultValue = "city") String level,
      @RequestParam(name = ReportParams.METRIC, required = false, defaultValue = "revenue") String metric,
      @RequestParam(name = ReportParams.LIMIT, required = false, defaultValue = "10") @Min(1) int limit) {
    return ApiResponse.builder()
        .data(adminReportService.getPopularLocationsReport(from, to, level, metric, limit))
        .build();
  }

  @GetMapping(ReportEndpoints.TRENDS + ReportEndpoints.POPULAR_ROOM_TYPES)
  public ApiResponse<?> getPopularRoomTypesReport(
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.GROUP_BY, required = false, defaultValue = "occupancy") String groupBy,
      @RequestParam(name = ReportParams.LIMIT, required = false, defaultValue = "10") @Min(1) int limit) {
    return ApiResponse.builder()
        .data(adminReportService.getPopularRoomTypesReport(from, to, groupBy, limit))
        .build();
  }

  @GetMapping(ReportEndpoints.FINANCIALS)
  public ApiResponse<?> getFinancialsReport(
      @RequestParam(name = ReportParams.FROM) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = ReportParams.TO) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(name = ReportParams.GROUP_BY, required = false, defaultValue = "day") String groupBy,
      @RequestParam(name = ReportParams.COMPARE_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareFrom,
      @RequestParam(name = ReportParams.COMPARE_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareTo) {
    // Validate comparison parameters: both must be provided or both must be null
    if ((compareFrom != null && compareTo == null) || (compareFrom == null && compareTo != null)) {
      throw new com.webapp.holidate.exception.AppException(
          com.webapp.holidate.type.ErrorType.INVALID_DATE_RANGE);
    }

    if (compareFrom != null && compareTo != null) {
      return ApiResponse.builder()
          .data(adminReportService.getFinancialsReportWithComparison(
              from, to, groupBy, compareFrom, compareTo))
          .build();
    }
    return ApiResponse.builder()
        .data(adminReportService.getFinancialsReport(from, to, groupBy))
        .build();
  }

  /**
   * Generate system daily reports for all dates in the system.
   * This endpoint processes all historical data similar to the background job,
   * but for all dates instead of just yesterday.
   * Note: Should be run after PartnerReportService.generateAllDailyReports() to ensure
   * HotelDailyReport data is available.
   * 
   * @return Summary of the operation including total dates processed, success and failure counts
   */
  @PostMapping(ReportEndpoints.GENERATE_ALL)
  public ApiResponse<?> generateAllSystemDailyReports() {
    return ApiResponse.builder()
        .data(adminReportService.generateAllSystemDailyReports())
        .build();
  }
}
