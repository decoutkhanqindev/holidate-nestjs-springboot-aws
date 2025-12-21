package com.webapp.holidate.repository.booking;

import com.webapp.holidate.constants.db.query.DashboardQueries;
import com.webapp.holidate.constants.db.query.booking.BookingQueries;
import com.webapp.holidate.entity.booking.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.Nullable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, String> {
  @Query(BookingQueries.FIND_BY_STATUS_AND_CREATED_AT_BEFORE)
  List<Booking> findByStatusAndCreatedAtBefore(String status, LocalDateTime createdAt);

  // Find no-show bookings by checkInDate and status
  @Query(BookingQueries.FIND_NO_SHOW_BOOKINGS)
  List<Booking> findNoShowBookings(LocalDate checkInDate, String confirmedStatus, String rescheduledStatus);

  // Count confirmed bookings for a user (excluding cancelled bookings)
  long countByUserIdAndStatusIn(String userId, List<String> statuses);

  // Find booking by ID with all related entities loaded
  @Query(BookingQueries.FIND_BY_ID_WITH_ALL_RELATIONS)
  Optional<Booking> findByIdWithAllRelations(String id);

  // Optimized query for getById - only fetch basic relationships, no collections
  // Room inventories are not needed as pricesByDateRange is fetched separately via service
  @Query(BookingQueries.FIND_BY_ID_WITH_BASIC_RELATIONS)
  Optional<Booking> findByIdWithBasicRelations(String id);

  // Find booking by ID with room relation loaded
  @Query(BookingQueries.FIND_BY_ID_WITH_ROOM)
  Optional<Booking> findByIdWithRoom(String id);

  // Find all bookings with filters and pagination
  @Query(BookingQueries.FIND_ALL_WITH_FILTERS_PAGED)
  Page<Booking> findAllWithFiltersPaged(
    @Nullable String userId,
    @Nullable String roomId,
    @Nullable String hotelId,
    @Nullable String status,
    @Nullable LocalDate checkInDate,
    @Nullable LocalDate checkOutDate,
    @Nullable LocalDateTime createdFrom,
    @Nullable LocalDateTime createdTo,
    @Nullable Double minPrice,
    @Nullable Double maxPrice,
    @Nullable String contactEmail,
    @Nullable String contactPhone,
    @Nullable String contactFullName,
    Pageable pageable);

  long countByHotelId(String hotelId);

  long countByRoomId(String roomId);

  long countByUserId(String userId);

  long countByAppliedDiscountId(String discountId);
  
  // ============ DASHBOARD QUERIES ============
  
  /**
   * Count bookings with check-in today for a specific hotel
   */
  @Query(DashboardQueries.COUNT_CHECK_INS_TODAY)
  long countCheckInsToday(String hotelId, String confirmedStatus);
  
  /**
   * Count bookings with check-out today for a specific hotel
   */
  @Query(DashboardQueries.COUNT_CHECK_OUTS_TODAY)
  long countCheckOutsToday(String hotelId, String checkedInStatus);
  
  /**
   * Count in-house guests (currently staying) for a specific hotel
   */
  @Query(DashboardQueries.COUNT_IN_HOUSE_GUESTS)
  long countInHouseGuests(String hotelId, String checkedInStatus);
  
  /**
   * Get booking counts grouped by status
   * Returns List of Object[] where [0] = status (String), [1] = count (Long)
   */
  @Query(DashboardQueries.GET_BOOKING_STATUS_COUNTS)
  List<Object[]> getBookingStatusCounts(String hotelId, List<String> activeStatuses);
  
  /**
   * Get occupancy forecast for the next N days
   * Returns List of Object[] where [0] = date (Date), [1] = roomsBooked (Long)
   */
  @Query(value = DashboardQueries.GET_OCCUPANCY_FORECAST, nativeQuery = true)
  List<Object[]> getOccupancyForecast(String hotelId, int forecastDays, List<String> activeBookingStatuses);
  
  // ============ ADMIN DASHBOARD QUERIES ============
  
  /**
   * Get realtime financials for today
   * Sum of final prices from COMPLETED bookings that checked out today
   */
  @Query(DashboardQueries.GET_REALTIME_FINANCIALS_TODAY)
  Double getRealtimeFinancialsToday(String completedStatus);
  
  /**
   * Count bookings created today
   */
  @Query(DashboardQueries.COUNT_BOOKINGS_CREATED_TODAY)
  long countBookingsCreatedToday();
}
