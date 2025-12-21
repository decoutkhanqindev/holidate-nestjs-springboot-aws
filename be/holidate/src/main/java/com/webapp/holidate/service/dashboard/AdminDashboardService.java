package com.webapp.holidate.service.dashboard;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.holidate.dto.response.dashboard.admin.AdminDashboardSummaryResponse;
import com.webapp.holidate.dto.response.dashboard.admin.AggregatedFinancialsResponse;
import com.webapp.holidate.dto.response.dashboard.admin.BookingActivityResponse;
import com.webapp.holidate.dto.response.dashboard.admin.EcosystemGrowthResponse;
import com.webapp.holidate.dto.response.dashboard.admin.RealtimeFinancialsResponse;
import com.webapp.holidate.dto.response.dashboard.admin.TopPerformingHotelResponse;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.booking.BookingRepository;
import com.webapp.holidate.repository.report.HotelDailyReportRepository;
import com.webapp.holidate.repository.report.SystemDailyReportRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;
import com.webapp.holidate.type.booking.BookingStatusType;
import com.webapp.holidate.type.user.RoleType;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AdminDashboardService {
  
  BookingRepository bookingRepository;
  UserRepository userRepository;
  HotelRepository hotelRepository;
  SystemDailyReportRepository systemDailyReportRepository;
  HotelDailyReportRepository hotelDailyReportRepository;
  
  /**
   * Get admin dashboard summary
   * Provides system health snapshot with realtime and aggregated data
   * Executes multiple queries in parallel for optimal performance
   * 
   * @return Dashboard summary with financial metrics, booking activity, ecosystem growth, and top hotels
   */
  @Transactional(readOnly = true)
  public AdminDashboardSummaryResponse getAdminDashboardSummary() {
    // Execute queries in parallel using CompletableFuture
    CompletableFuture<RealtimeFinancialsResponse> realtimeFinancialsFuture = 
        CompletableFuture.supplyAsync(this::getRealtimeFinancialsForToday);
    
    CompletableFuture<AggregatedFinancialsResponse> aggregatedFinancialsFuture = 
        CompletableFuture.supplyAsync(this::getAggregatedFinancialsForMonthToDate);
    
    CompletableFuture<BookingActivityResponse> bookingActivityFuture = 
        CompletableFuture.supplyAsync(this::getRealtimeBookingActivityForToday);
    
    CompletableFuture<EcosystemGrowthResponse> ecosystemGrowthFuture = 
        CompletableFuture.supplyAsync(this::getRealtimeEcosystemGrowthForToday);
    
    CompletableFuture<List<TopPerformingHotelResponse>> topHotelsFuture = 
        CompletableFuture.supplyAsync(this::getAggregatedTopPerformingHotels);
    
    // Wait for all futures to complete
    try {
      CompletableFuture.allOf(
          realtimeFinancialsFuture,
          aggregatedFinancialsFuture,
          bookingActivityFuture,
          ecosystemGrowthFuture,
          topHotelsFuture
      ).join();
      
      // Get results
      RealtimeFinancialsResponse realtimeFinancials = realtimeFinancialsFuture.get();
      AggregatedFinancialsResponse aggregatedFinancials = aggregatedFinancialsFuture.get();
      
      // Combine realtime financials with aggregated financials
      double totalGrossRevenueThisMonth = aggregatedFinancials.getGrossRevenueMonthToDate() 
          + realtimeFinancials.getTotalRevenueToday();
      double totalNetRevenueThisMonth = aggregatedFinancials.getNetRevenueMonthToDate() 
          + realtimeFinancials.getTotalRevenueToday(); // Estimate: use same as gross for today
      
      aggregatedFinancials.setTotalGrossRevenueThisMonth(totalGrossRevenueThisMonth);
      aggregatedFinancials.setTotalNetRevenueThisMonth(totalNetRevenueThisMonth);
      
      // Aggregate results
      return AdminDashboardSummaryResponse.builder()
          .realtimeFinancials(realtimeFinancials)
          .aggregatedFinancials(aggregatedFinancials)
          .bookingActivity(bookingActivityFuture.get())
          .ecosystemGrowth(ecosystemGrowthFuture.get())
          .topPerformingHotels(topHotelsFuture.get())
          .topPerformingHotelsDays(7)
          .build();
          
    } catch (InterruptedException | ExecutionException e) {
      log.error("Error executing parallel admin dashboard queries", e);
      Thread.currentThread().interrupt();
      
      // Return empty response in case of error
      return AdminDashboardSummaryResponse.builder()
          .realtimeFinancials(RealtimeFinancialsResponse.builder().build())
          .aggregatedFinancials(AggregatedFinancialsResponse.builder().build())
          .bookingActivity(BookingActivityResponse.builder().build())
          .ecosystemGrowth(EcosystemGrowthResponse.builder().build())
          .topPerformingHotels(new ArrayList<>())
          .topPerformingHotelsDays(7)
          .build();
    }
  }
  
  /**
   * Get realtime financials for today
   * Sum of final prices from COMPLETED bookings that checked out today
   */
  private RealtimeFinancialsResponse getRealtimeFinancialsForToday() {
    try {
      String completedStatus = BookingStatusType.COMPLETED.getValue();
      Double totalRevenue = bookingRepository.getRealtimeFinancialsToday(completedStatus);
      
      return RealtimeFinancialsResponse.builder()
          .totalRevenueToday(totalRevenue != null ? totalRevenue : 0.0)
          .build();
          
    } catch (Exception e) {
      log.error("Error fetching realtime financials for today", e);
      return RealtimeFinancialsResponse.builder().build();
    }
  }
  
  /**
   * Get aggregated financials for month-to-date
   * Data from SystemDailyReport (excludes today)
   */
  private AggregatedFinancialsResponse getAggregatedFinancialsForMonthToDate() {
    try {
      // Get first day of current month
      LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
      
      Object[] result = systemDailyReportRepository.getAggregatedFinancialsMTD(monthStart);
      
      double grossRevenue = 0.0;
      double netRevenue = 0.0;
      
      if (result != null && result.length >= 2) {
        grossRevenue = result[0] != null ? ((Number) result[0]).doubleValue() : 0.0;
        netRevenue = result[1] != null ? ((Number) result[1]).doubleValue() : 0.0;
      }
      
      return AggregatedFinancialsResponse.builder()
          .grossRevenueMonthToDate(grossRevenue)
          .netRevenueMonthToDate(netRevenue)
          .build();
          
    } catch (Exception e) {
      log.error("Error fetching aggregated financials for month-to-date", e);
      return AggregatedFinancialsResponse.builder().build();
    }
  }
  
  /**
   * Get realtime booking activity for today
   * Count of bookings created today
   */
  private BookingActivityResponse getRealtimeBookingActivityForToday() {
    try {
      long bookingsCreated = bookingRepository.countBookingsCreatedToday();
      
      return BookingActivityResponse.builder()
          .bookingsCreatedToday(bookingsCreated)
          .build();
          
    } catch (Exception e) {
      log.error("Error fetching realtime booking activity for today", e);
      return BookingActivityResponse.builder().build();
    }
  }
  
  /**
   * Get realtime ecosystem growth for today
   * New users, partners, and total active hotels
   */
  private EcosystemGrowthResponse getRealtimeEcosystemGrowthForToday() {
    try {
      String userRoleName = RoleType.USER.getValue();
      String partnerRoleName = RoleType.PARTNER.getValue();
      String activeStatus = AccommodationStatusType.ACTIVE.getValue();
      
      long newCustomers = userRepository.countNewUsersToday(userRoleName);
      long newPartners = userRepository.countNewPartnersToday(partnerRoleName);
      long totalActiveHotels = hotelRepository.countTotalActiveHotels(activeStatus);
      
      return EcosystemGrowthResponse.builder()
          .newCustomersToday(newCustomers)
          .newPartnersToday(newPartners)
          .totalActiveHotels(totalActiveHotels)
          .build();
          
    } catch (Exception e) {
      log.error("Error fetching realtime ecosystem growth for today", e);
      return EcosystemGrowthResponse.builder().build();
    }
  }
  
  /**
   * Get top performing hotels in the last 7 days
   * Data from HotelDailyReport
   */
  private List<TopPerformingHotelResponse> getAggregatedTopPerformingHotels() {
    try {
      LocalDate toDate = LocalDate.now().minusDays(1); // Yesterday (last complete day)
      LocalDate fromDate = toDate.minusDays(6); // 7 days ago
      int limit = 5; // Top 5 hotels
      
      List<Object[]> results = hotelDailyReportRepository.getTopPerformingHotels(
          fromDate, 
          toDate, 
          limit
      );
      
      return results.stream()
          .map(row -> TopPerformingHotelResponse.builder()
              .hotelId((String) row[0])
              .hotelName((String) row[1])
              .totalRevenue(row[2] != null ? ((Number) row[2]).doubleValue() : 0.0)
              .totalBookings(row[3] != null ? ((Number) row[3]).longValue() : 0L)
              .build())
          .collect(Collectors.toList());
          
    } catch (Exception e) {
      log.error("Error fetching top performing hotels", e);
      return new ArrayList<>();
    }
  }
}

