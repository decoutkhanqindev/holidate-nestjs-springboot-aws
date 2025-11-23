package com.webapp.holidate.service.dashboard;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.holidate.dto.response.dashboard.BookingStatusCountResponse;
import com.webapp.holidate.dto.response.dashboard.DashboardSummaryResponse;
import com.webapp.holidate.dto.response.dashboard.OccupancyForecastItemResponse;
import com.webapp.holidate.dto.response.dashboard.RoomStatusCountResponse;
import com.webapp.holidate.dto.response.dashboard.TodaysActivityResponse;
import com.webapp.holidate.repository.accommodation.room.RoomRepository;
import com.webapp.holidate.repository.booking.BookingRepository;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;
import com.webapp.holidate.type.booking.BookingStatusType;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PartnerDashboardService {
  
  BookingRepository bookingRepository;
  RoomRepository roomRepository;
  
  /**
   * Get dashboard summary for a hotel
   * Executes multiple queries in parallel for optimal performance
   * 
   * @param hotelId ID of the hotel
   * @param forecastDays Number of days to forecast (default: 7, max: 30)
   * @return Dashboard summary with today's activity, booking status, room status, and occupancy forecast
   */
  @Transactional(readOnly = true)
  public DashboardSummaryResponse getDashboardSummary(String hotelId, Integer forecastDays) {
    // Validate and set default forecast days
    int validatedForecastDays = validateForecastDays(forecastDays);
    
    // Execute queries in parallel using CompletableFuture
    CompletableFuture<TodaysActivityResponse> todaysActivityFuture = 
        CompletableFuture.supplyAsync(() -> getTodaysActivity(hotelId));
    
    CompletableFuture<List<BookingStatusCountResponse>> bookingStatusFuture = 
        CompletableFuture.supplyAsync(() -> getLiveBookingStatusCounts(hotelId));
    
    CompletableFuture<List<RoomStatusCountResponse>> roomStatusFuture = 
        CompletableFuture.supplyAsync(() -> getLiveRoomStatusCounts(hotelId));
    
    CompletableFuture<List<OccupancyForecastItemResponse>> occupancyForecastFuture = 
        CompletableFuture.supplyAsync(() -> getOccupancyForecast(hotelId, validatedForecastDays));
    
    // Wait for all futures to complete
    try {
      CompletableFuture.allOf(
          todaysActivityFuture, 
          bookingStatusFuture, 
          roomStatusFuture, 
          occupancyForecastFuture
      ).join();
      
      // Aggregate results
      return DashboardSummaryResponse.builder()
          .todaysActivity(todaysActivityFuture.get())
          .bookingStatusCounts(bookingStatusFuture.get())
          .roomStatusCounts(roomStatusFuture.get())
          .occupancyForecast(occupancyForecastFuture.get())
          .forecastDays(validatedForecastDays)
          .build();
          
    } catch (InterruptedException | ExecutionException e) {
      log.error("Error executing parallel dashboard queries for hotel {}", hotelId, e);
      Thread.currentThread().interrupt();
      
      // Return empty response in case of error
      return DashboardSummaryResponse.builder()
          .todaysActivity(TodaysActivityResponse.builder().build())
          .bookingStatusCounts(new ArrayList<>())
          .roomStatusCounts(new ArrayList<>())
          .occupancyForecast(new ArrayList<>())
          .forecastDays(validatedForecastDays)
          .build();
    }
  }
  
  /**
   * Validate forecast days parameter
   * @param forecastDays Requested forecast days
   * @return Validated forecast days (between 1 and 30, default 7)
   */
  private int validateForecastDays(Integer forecastDays) {
    if (forecastDays == null) {
      return 7; // Default value
    }
    
    if (forecastDays < 1) {
      return 1;
    }
    
    if (forecastDays > 30) {
      return 30; // Maximum value to avoid heavy queries
    }
    
    return forecastDays;
  }
  
  /**
   * Get today's activity summary
   * - Check-ins today: bookings with checkInDate = today and status = CONFIRMED
   * - Check-outs today: bookings with checkOutDate = today and status = CHECKED_IN
   * - In-house guests: bookings with status = CHECKED_IN
   */
  private TodaysActivityResponse getTodaysActivity(String hotelId) {
    try {
      String confirmedStatus = BookingStatusType.CONFIRMED.getValue();
      String checkedInStatus = BookingStatusType.CHECKED_IN.getValue();
      
      long checkInsToday = bookingRepository.countCheckInsToday(hotelId, confirmedStatus);
      long checkOutsToday = bookingRepository.countCheckOutsToday(hotelId, checkedInStatus);
      long inHouseGuests = bookingRepository.countInHouseGuests(hotelId, checkedInStatus);
      
      return TodaysActivityResponse.builder()
          .checkInsToday(checkInsToday)
          .checkOutsToday(checkOutsToday)
          .inHouseGuests(inHouseGuests)
          .build();
          
    } catch (Exception e) {
      log.error("Error fetching today's activity for hotel {}", hotelId, e);
      return TodaysActivityResponse.builder().build();
    }
  }
  
  /**
   * Get live booking status counts
   * Returns counts for active booking statuses: PENDING_PAYMENT, CONFIRMED, CHECKED_IN
   */
  private List<BookingStatusCountResponse> getLiveBookingStatusCounts(String hotelId) {
    try {
      List<String> activeStatuses = List.of(
          BookingStatusType.PENDING_PAYMENT.getValue(),
          BookingStatusType.CONFIRMED.getValue(),
          BookingStatusType.CHECKED_IN.getValue()
      );
      
      List<Object[]> results = bookingRepository.getBookingStatusCounts(hotelId, activeStatuses);
      
      return results.stream()
          .map(row -> BookingStatusCountResponse.builder()
              .status((String) row[0])
              .count(((Number) row[1]).longValue())
              .build())
          .collect(Collectors.toList());
          
    } catch (Exception e) {
      log.error("Error fetching booking status counts for hotel {}", hotelId, e);
      return new ArrayList<>();
    }
  }
  
  /**
   * Get live room status counts
   * Returns counts for all room statuses
   */
  private List<RoomStatusCountResponse> getLiveRoomStatusCounts(String hotelId) {
    try {
      List<Object[]> results = roomRepository.getRoomStatusCounts(hotelId);
      
      return results.stream()
          .map(row -> RoomStatusCountResponse.builder()
              .status((String) row[0])
              .count(((Number) row[1]).longValue())
              .build())
          .collect(Collectors.toList());
          
    } catch (Exception e) {
      log.error("Error fetching room status counts for hotel {}", hotelId, e);
      return new ArrayList<>();
    }
  }
  
  /**
   * Get occupancy forecast for the next N days
   * Shows expected occupancy for each day based on CONFIRMED and CHECKED_IN bookings
   */
  private List<OccupancyForecastItemResponse> getOccupancyForecast(String hotelId, int forecastDays) {
    try {
      // Get total room capacity (only active rooms)
      String activeStatus = AccommodationStatusType.ACTIVE.getValue();
      long totalCapacity = roomRepository.getTotalRoomCapacity(hotelId, activeStatus);
      
      // Get active booking statuses for forecast
      List<String> activeBookingStatuses = List.of(
          BookingStatusType.CONFIRMED.getValue(),
          BookingStatusType.CHECKED_IN.getValue()
      );
      
      // Get occupancy data from repository
      List<Object[]> results = bookingRepository.getOccupancyForecast(
          hotelId, 
          forecastDays, 
          activeBookingStatuses
      );
      
      // Map results to response objects with occupancy rate calculation
      return results.stream()
          .map(row -> {
            // row[0] = date (java.sql.Date), row[1] = roomsBooked (BigDecimal or Long)
            LocalDate date = ((Date) row[0]).toLocalDate();
            long roomsBooked = ((Number) row[1]).longValue();
            
            // Calculate occupancy rate
            double occupancyRate = calculateOccupancyRate(roomsBooked, totalCapacity);
            
            return OccupancyForecastItemResponse.builder()
                .date(date)
                .roomsBooked(roomsBooked)
                .totalCapacity(totalCapacity)
                .occupancyRate(occupancyRate)
                .build();
          })
          .collect(Collectors.toList());
          
    } catch (Exception e) {
      log.error("Error fetching occupancy forecast for hotel {}", hotelId, e);
      return new ArrayList<>();
    }
  }
  
  /**
   * Calculate occupancy rate as percentage
   * @param roomsBooked Number of rooms booked
   * @param totalCapacity Total room capacity
   * @return Occupancy rate as percentage (0-100), rounded to 2 decimal places
   */
  private double calculateOccupancyRate(long roomsBooked, long totalCapacity) {
    if (totalCapacity == 0) {
      return 0.0;
    }
    
    BigDecimal rate = BigDecimal.valueOf(roomsBooked)
        .multiply(BigDecimal.valueOf(100))
        .divide(BigDecimal.valueOf(totalCapacity), 2, RoundingMode.HALF_UP);
    
    return rate.doubleValue();
  }
}

