package com.webapp.holidate.controller.dashboard;

import com.webapp.holidate.constants.api.endpoint.DashboardEndpoints;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.service.dashboard.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(DashboardEndpoints.ADMIN_DASHBOARD)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AdminDashboardController {
  
  AdminDashboardService adminDashboardService;
  
  /**
   * Get operational dashboard summary for admin
   * 
   * This endpoint provides a system health snapshot including:
   * - Realtime financials for today
   * - Aggregated financials for month-to-date
   * - Realtime booking activity for today
   * - Realtime ecosystem growth (users, partners, hotels)
   * - Top performing hotels in the last 7 days
   * 
   * No parameters required - returns predefined data for fixed time periods
   * (today, month-to-date, last 7 days) for fast response
   * 
   * @return Dashboard summary with system health metrics
   */
  @GetMapping(DashboardEndpoints.SUMMARY)
  public ApiResponse<?> getAdminDashboardSummary() {
    return ApiResponse.builder()
        .data(adminDashboardService.getAdminDashboardSummary())
        .build();
  }
}

