package com.webapp.holidate.controller.dashboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.holidate.constants.api.endpoint.DashboardEndpoints;
import com.webapp.holidate.constants.api.param.DashboardParams;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.service.dashboard.PartnerDashboardService;
import com.webapp.holidate.type.ErrorType;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping(DashboardEndpoints.PARTNER_DASHBOARD)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PartnerDashboardController {
  
  PartnerDashboardService partnerDashboardService;
  
  /**
   * Get operational dashboard summary for a partner's hotel
   * 
   * This endpoint provides near real-time operational data including:
   * - Today's activity (check-ins, check-outs, in-house guests)
   * - Live booking status counts
   * - Live room status counts
   * - Occupancy forecast for upcoming days
   * 
   * @param hotelId ID of the hotel (required)
   * @param forecastDays Number of days to forecast (optional, default: 7, max: 30)
   * @return Dashboard summary with operational metrics
   */
  @GetMapping(DashboardEndpoints.SUMMARY)
  public ApiResponse<?> getDashboardSummary(
      @RequestParam(name = DashboardParams.HOTEL_ID) String hotelId,
      @RequestParam(name = DashboardParams.FORECAST_DAYS, required = false, 
                    defaultValue = DashboardParams.DEFAULT_FORECAST_DAYS) Integer forecastDays) {
    
    // Manual validation following project pattern
    if (hotelId == null || hotelId.isBlank()) {
      throw new AppException(ErrorType.HOTEL_NOT_FOUND);
    }
    
    if (forecastDays < DashboardParams.MIN_FORECAST_DAYS || forecastDays > DashboardParams.MAX_FORECAST_DAYS) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }
    
    return ApiResponse.builder()
        .data(partnerDashboardService.getDashboardSummary(hotelId, forecastDays))
        .build();
  }
}

