package com.webapp.holidate.constants.db.query;

public class DashboardQueries {
  
  // ============ TODAY'S ACTIVITY QUERIES ============
  
  /**
   * Count bookings with check-in today
   * Status: CONFIRMED (bookings scheduled to check in today)
   */
  public static final String COUNT_CHECK_INS_TODAY = 
    "SELECT COUNT(b.id) FROM Booking b " +
    "WHERE b.hotel.id = :hotelId " +
    "AND b.checkInDate = CURRENT_DATE " +
    "AND b.status = :confirmedStatus";
  
  /**
   * Count bookings with check-out today
   * Status: CHECKED_IN (guests currently in-house who need to check out today)
   */
  public static final String COUNT_CHECK_OUTS_TODAY = 
    "SELECT COUNT(b.id) FROM Booking b " +
    "WHERE b.hotel.id = :hotelId " +
    "AND b.checkOutDate = CURRENT_DATE " +
    "AND b.status = :checkedInStatus";
  
  /**
   * Count in-house guests (currently staying)
   * Status: CHECKED_IN
   */
  public static final String COUNT_IN_HOUSE_GUESTS = 
    "SELECT COUNT(b.id) FROM Booking b " +
    "WHERE b.hotel.id = :hotelId " +
    "AND b.status = :checkedInStatus";
  
  // ============ BOOKING STATUS COUNTS ============
  
  /**
   * Get booking counts grouped by status
   * Returns active booking statuses: PENDING_PAYMENT, CONFIRMED, CHECKED_IN
   */
  public static final String GET_BOOKING_STATUS_COUNTS = 
    "SELECT b.status, COUNT(b.id) " +
    "FROM Booking b " +
    "WHERE b.hotel.id = :hotelId " +
    "AND b.status IN (:activeStatuses) " +
    "GROUP BY b.status";
  
  // ============ ROOM STATUS COUNTS ============
  
  /**
   * Get room counts grouped by status
   * Uses Room.quantity to get total number of rooms per status
   */
  public static final String GET_ROOM_STATUS_COUNTS = 
    "SELECT r.status, SUM(r.quantity) " +
    "FROM Room r " +
    "WHERE r.hotel.id = :hotelId " +
    "GROUP BY r.status";
  
  // ============ OCCUPANCY FORECAST ============
  
  /**
   * Get occupancy forecast for the next N days
   * Counts confirmed and checked-in bookings that overlap with each date
   * Returns date and number of rooms booked for that date
   * 
   * Native query to use date generation and proper date range overlap logic
   */
  public static final String GET_OCCUPANCY_FORECAST = 
    "SELECT " +
    "  dates.forecast_date as date, " +
    "  COALESCE(SUM(b.number_of_rooms), 0) as rooms_booked " +
    "FROM ( " +
    "  SELECT CURDATE() + INTERVAL seq DAY as forecast_date " +
    "  FROM ( " +
    "    SELECT 0 as seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 " +
    "    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 " +
    "    UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 " +
    "    UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 " +
    "    UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 " +
    "    UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 " +
    "    UNION ALL SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 " +
    "    UNION ALL SELECT 28 UNION ALL SELECT 29 " +
    "  ) seq_table " +
    "  WHERE seq < :forecastDays " +
    ") dates " +
    "LEFT JOIN bookings b ON " +
    "  b.hotel_id = :hotelId " +
    "  AND dates.forecast_date >= b.check_in_date " +
    "  AND dates.forecast_date < b.check_out_date " +
    "  AND b.status IN (:activeBookingStatuses) " +
    "GROUP BY dates.forecast_date " +
    "ORDER BY dates.forecast_date";
  
  /**
   * Get total room capacity for a hotel
   */
  public static final String GET_TOTAL_ROOM_CAPACITY = 
    "SELECT COALESCE(SUM(r.quantity), 0) " +
    "FROM Room r " +
    "WHERE r.hotel.id = :hotelId " +
    "AND r.status = :activeStatus";
  
  // ============ ADMIN DASHBOARD QUERIES ============
  
  /**
   * Get realtime financials for today (COMPLETED bookings that checked out today)
   * Returns Object[] with: [0] = totalRevenue (Double)
   */
  public static final String GET_REALTIME_FINANCIALS_TODAY = 
    "SELECT COALESCE(SUM(b.finalPrice), 0.0) " +
    "FROM Booking b " +
    "WHERE b.status = :completedStatus " +
    "AND b.checkOutDate = CURRENT_DATE";
  
  /**
   * Get aggregated financials for month-to-date from SystemDailyReport
   * Returns Object[] with: [0] = grossRevenue (Double), [1] = netRevenue (Double)
   */
  public static final String GET_AGGREGATED_FINANCIALS_MTD = 
    "SELECT " +
    "  COALESCE(SUM(sdr.grossRevenue), 0.0), " +
    "  COALESCE(SUM(sdr.netRevenue), 0.0) " +
    "FROM SystemDailyReport sdr " +
    "WHERE sdr.reportDate >= :monthStart " +
    "AND sdr.reportDate < CURRENT_DATE";
  
  /**
   * Get realtime booking activity for today
   * Count bookings created today
   */
  public static final String COUNT_BOOKINGS_CREATED_TODAY = 
    "SELECT COUNT(b.id) " +
    "FROM Booking b " +
    "WHERE DATE(b.createdAt) = CURRENT_DATE";
  
  /**
   * Get realtime ecosystem growth for today
   * Count new users (customers) registered today
   */
  public static final String COUNT_NEW_USERS_TODAY = 
    "SELECT COUNT(u.id) " +
    "FROM User u " +
    "WHERE u.role.name = :roleName " +
    "AND DATE(u.createdAt) = CURRENT_DATE";
  
  /**
   * Get realtime ecosystem growth for today
   * Count new partners registered today
   */
  public static final String COUNT_NEW_PARTNERS_TODAY = 
    "SELECT COUNT(u.id) " +
    "FROM User u " +
    "WHERE u.role.name = :roleName " +
    "AND DATE(u.createdAt) = CURRENT_DATE";
  
  /**
   * Get total count of active hotels
   */
  public static final String COUNT_TOTAL_ACTIVE_HOTELS = 
    "SELECT COUNT(h.id) " +
    "FROM Hotel h " +
    "WHERE h.status = :activeStatus";
  
  /**
   * Get top performing hotels in the last N days
   * Returns List of Object[] with: [0] = hotelId (String), [1] = hotelName (String), 
   *                                 [2] = totalRevenue (Double), [3] = totalBookings (Long)
   * Native query to leverage HotelDailyReport aggregations
   */
  public static final String GET_TOP_PERFORMING_HOTELS = 
    "SELECT " +
    "  h.id as hotel_id, " +
    "  h.name as hotel_name, " +
    "  COALESCE(SUM(hdr.total_revenue), 0.0) as total_revenue, " +
    "  COALESCE(SUM(hdr.completed_bookings), 0) as total_bookings " +
    "FROM hotel_daily_reports hdr " +
    "JOIN hotels h ON hdr.hotel_id = h.id " +
    "WHERE hdr.report_date >= :fromDate " +
    "AND hdr.report_date <= :toDate " +
    "GROUP BY h.id, h.name " +
    "ORDER BY total_revenue DESC " +
    "LIMIT :limit";
}

