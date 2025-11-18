package com.webapp.holidate.constants.db.query.report;

import com.webapp.holidate.constants.db.DbTableNames;

public class ReportQueries {

  // Query to get all bookings related to report date D
  // This is the intermediate dataset mentioned in Step 1
  // Note: Using date range comparisons for LocalDateTime fields (createdAt,
  // updatedAt)
  // and direct date comparison for LocalDate fields (checkInDate, checkOutDate)
  public static final String FIND_BOOKINGS_FOR_REPORT_DATE = "SELECT b FROM Booking b " +
      "WHERE " +
      "(b.createdAt >= :reportDateStart AND b.createdAt < :reportDateEnd) " +
      "OR (b.checkOutDate = :reportDate AND b.status = :completedStatus) " +
      "OR (b.updatedAt >= :reportDateStart AND b.updatedAt < :reportDateEnd AND b.status = :cancelledStatus) " +
      "OR (b.checkInDate <= :reportDate AND b.checkOutDate > :reportDate " +
      "    AND b.status IN (:confirmedStatus, :checkedInStatus))";

  // Query to calculate hotel metrics grouped by hotelId
  // This aggregates data for HotelDailyReport (Step 2)
  public static final String CALCULATE_HOTEL_METRICS = "SELECT " +
      "  b.hotel.id as hotelId, " +
      "  COALESCE(SUM(CASE WHEN b.status = :completedStatus AND b.checkOutDate = :reportDate " +
      "    THEN b.finalPrice ELSE 0 END), 0) as totalRevenue, " +
      "  COUNT(CASE WHEN DATE(b.createdAt) = :reportDate THEN 1 END) as createdBookings, " +
      "  COUNT(CASE WHEN DATE(b.createdAt) = :reportDate AND b.status = :pendingPaymentStatus " +
      "    THEN 1 END) as pendingPaymentBookings, " +
      "  COUNT(CASE WHEN DATE(b.createdAt) = :reportDate AND b.status = :confirmedStatus " +
      "    THEN 1 END) as confirmedBookings, " +
      "  COUNT(CASE WHEN DATE(b.createdAt) = :reportDate AND b.status = :checkedInStatus " +
      "    THEN 1 END) as checkedInBookings, " +
      "  COUNT(CASE WHEN b.status = :completedStatus AND b.checkOutDate = :reportDate " +
      "    THEN 1 END) as completedBookings, " +
      "  COUNT(CASE WHEN b.status = :cancelledStatus AND DATE(b.updatedAt) = :reportDate " +
      "    THEN 1 END) as cancelledBookings, " +
      "  COUNT(CASE WHEN DATE(b.createdAt) = :reportDate AND b.status = :rescheduledStatus " +
      "    THEN 1 END) as rescheduledBookings, " +
      "  COALESCE(SUM(CASE WHEN b.status IN (:confirmedStatus, :checkedInStatus) " +
      "    AND b.checkInDate <= :reportDate AND b.checkOutDate > :reportDate " +
      "    THEN b.numberOfRooms ELSE 0 END), 0) as occupiedRoomNights " +
      "FROM Booking b " +
      "WHERE " +
      "(DATE(b.createdAt) = :reportDate) " +
      "OR (b.checkOutDate = :reportDate AND b.status = :completedStatus) " +
      "OR (DATE(b.updatedAt) = :reportDate AND b.status = :cancelledStatus) " +
      "OR (b.checkInDate <= :reportDate AND b.checkOutDate > :reportDate " +
      "    AND b.status IN (:confirmedStatus, :checkedInStatus)) " +
      "GROUP BY b.hotel.id";

  // Query to get total room nights for a hotel (sum of quantity for ACTIVE rooms)
  public static final String GET_TOTAL_ROOM_NIGHTS_BY_HOTEL = "SELECT COALESCE(SUM(r.quantity), 0) FROM Room r " +
      "WHERE r.hotel.id = :hotelId AND r.status = :activeStatus";

  // Query to find first completion date for each (userId, hotelId) pair
  // Used for calculating newCustomerBookings and returningCustomerBookings
  public static final String FIND_FIRST_COMPLETION_DATES = "SELECT b.user.id as userId, b.hotel.id as hotelId, MIN(b.checkOutDate) as firstCompletionDate "
      +
      "FROM Booking b " +
      "WHERE b.status = :completedStatus " +
      "GROUP BY b.user.id, b.hotel.id";

  // Query to calculate new and returning customer bookings
  public static final String CALCULATE_CUSTOMER_BOOKING_METRICS = "SELECT " +
      "  b.hotel.id as hotelId, " +
      "  COUNT(CASE WHEN b.status = :completedStatus AND b.checkOutDate = :reportDate " +
      "    AND firstCompletion.firstCompletionDate = :reportDate THEN 1 END) as newCustomerBookings, " +
      "  COUNT(CASE WHEN b.status = :completedStatus AND b.checkOutDate = :reportDate " +
      "    AND firstCompletion.firstCompletionDate < :reportDate THEN 1 END) as returningCustomerBookings " +
      "FROM Booking b " +
      "LEFT JOIN (" +
      "  SELECT b2.user.id as userId, b2.hotel.id as hotelId, MIN(b2.checkOutDate) as firstCompletionDate " +
      "  FROM Booking b2 " +
      "  WHERE b2.status = :completedStatus " +
      "  GROUP BY b2.user.id, b2.hotel.id" +
      ") firstCompletion ON b.user.id = firstCompletion.userId AND b.hotel.id = firstCompletion.hotelId " +
      "WHERE b.status = :completedStatus AND b.checkOutDate = :reportDate " +
      "GROUP BY b.hotel.id";

  // Query to calculate room metrics grouped by roomId (Step 3)
  public static final String CALCULATE_ROOM_METRICS = "SELECT " +
      "  b.room.id as roomId, " +
      "  b.hotel.id as hotelId, " +
      "  COALESCE(SUM(CASE WHEN b.status = :completedStatus AND b.checkOutDate = :reportDate " +
      "    THEN b.finalPrice ELSE 0 END), 0) as revenue, " +
      "  COALESCE(SUM(CASE WHEN b.status IN (:confirmedStatus, :checkedInStatus) " +
      "    AND b.checkInDate <= :reportDate AND b.checkOutDate > :reportDate " +
      "    THEN b.numberOfRooms ELSE 0 END), 0) as bookedRoomNights " +
      "FROM Booking b " +
      "WHERE " +
      "(b.checkOutDate = :reportDate AND b.status = :completedStatus) " +
      "OR (b.checkInDate <= :reportDate AND b.checkOutDate > :reportDate " +
      "    AND b.status IN (:confirmedStatus, :checkedInStatus)) " +
      "GROUP BY b.room.id, b.hotel.id";

  // Query to aggregate review data by hotel (Step 4)
  public static final String CALCULATE_REVIEW_METRICS = "SELECT " +
      "  r.hotel.id as hotelId, " +
      "  AVG(r.score) as averageReviewScore, " +
      "  COUNT(r.id) as reviewCount " +
      "FROM Review r " +
      "WHERE r.createdAt >= :reportDateStart AND r.createdAt < :reportDateEnd " +
      "GROUP BY r.hotel.id";

  // Native query for bulk upsert using MySQL ON DUPLICATE KEY UPDATE
  public static final String UPSERT_HOTEL_DAILY_REPORT = "INSERT INTO " + DbTableNames.HOTEL_DAILY_REPORTS + " " +
      "(hotel_id, report_date, total_revenue, created_bookings, pending_payment_bookings, " +
      "confirmed_bookings, checked_in_bookings, completed_bookings, cancelled_bookings, " +
      "rescheduled_bookings, occupied_room_nights, total_room_nights, new_customer_bookings, " +
      "returning_customer_bookings, average_review_score, review_count, updated_at) " +
      "VALUES (:hotelId, :reportDate, :totalRevenue, :createdBookings, :pendingPaymentBookings, " +
      ":confirmedBookings, :checkedInBookings, :completedBookings, :cancelledBookings, " +
      ":rescheduledBookings, :occupiedRoomNights, :totalRoomNights, :newCustomerBookings, " +
      ":returningCustomerBookings, :averageReviewScore, :reviewCount, :updatedAt) " +
      "ON DUPLICATE KEY UPDATE " +
      "total_revenue = VALUES(total_revenue), " +
      "created_bookings = VALUES(created_bookings), " +
      "pending_payment_bookings = VALUES(pending_payment_bookings), " +
      "confirmed_bookings = VALUES(confirmed_bookings), " +
      "checked_in_bookings = VALUES(checked_in_bookings), " +
      "completed_bookings = VALUES(completed_bookings), " +
      "cancelled_bookings = VALUES(cancelled_bookings), " +
      "rescheduled_bookings = VALUES(rescheduled_bookings), " +
      "occupied_room_nights = VALUES(occupied_room_nights), " +
      "total_room_nights = VALUES(total_room_nights), " +
      "new_customer_bookings = VALUES(new_customer_bookings), " +
      "returning_customer_bookings = VALUES(returning_customer_bookings), " +
      "average_review_score = VALUES(average_review_score), " +
      "review_count = VALUES(review_count), " +
      "updated_at = VALUES(updated_at)";

  // Native query for bulk upsert using MySQL ON DUPLICATE KEY UPDATE
  public static final String UPSERT_ROOM_DAILY_PERFORMANCE = "INSERT INTO " + DbTableNames.ROOM_DAILY_PERFORMANCES + " "
      +
      "(room_id, report_date, hotel_id, revenue, booked_room_nights, updated_at) " +
      "VALUES (:roomId, :reportDate, :hotelId, :revenue, :bookedRoomNights, :updatedAt) " +
      "ON DUPLICATE KEY UPDATE " +
      "hotel_id = VALUES(hotel_id), " +
      "revenue = VALUES(revenue), " +
      "booked_room_nights = VALUES(booked_room_nights), " +
      "updated_at = VALUES(updated_at)";

  // Query to aggregate data from HotelDailyReport (Step 1 for Admin)
  public static final String AGGREGATE_HOTEL_DAILY_REPORTS = "SELECT " +
      "  COALESCE(SUM(total_revenue), 0) as grossRevenue, " +
      "  COALESCE(SUM(created_bookings), 0) as totalBookingsCreated, " +
      "  COALESCE(SUM(completed_bookings), 0) as totalBookingsCompleted, " +
      "  COALESCE(SUM(cancelled_bookings), 0) as totalBookingsCancelled, " +
      "  COALESCE(SUM(review_count), 0) as totalReviews, " +
      "  COALESCE(SUM(average_review_score * review_count), 0) as totalWeightedScore " +
      "FROM " + DbTableNames.HOTEL_DAILY_REPORTS + " " +
      "WHERE report_date = :reportDate";

  // Query to calculate net revenue from Booking and Hotel (Step 2 for Admin)
  public static final String CALCULATE_NET_REVENUE = "SELECT " +
      "  COALESCE(SUM(b.final_price * h.commission_rate / 100), 0) as netRevenue " +
      "FROM " + DbTableNames.BOOKINGS + " b " +
      "JOIN " + DbTableNames.HOTELS + " h ON b.hotel_id = h.id " +
      "WHERE b.check_out_date = :reportDate AND b.status = :completedStatus";

  // Query to count new customers registered (Step 3 for Admin)
  public static final String COUNT_NEW_CUSTOMERS = "SELECT COUNT(u.id) " +
      "FROM " + DbTableNames.USERS + " u " +
      "JOIN " + DbTableNames.ROLES + " r ON u.role_id = r.id " +
      "WHERE r.name = :customerRoleName " +
      "AND u.created_at >= :reportDateStart AND u.created_at < :reportDateEnd";

  // Query to count new partners registered (Step 3 for Admin)
  public static final String COUNT_NEW_PARTNERS = "SELECT COUNT(u.id) " +
      "FROM " + DbTableNames.USERS + " u " +
      "JOIN " + DbTableNames.ROLES + " r ON u.role_id = r.id " +
      "WHERE r.name = :partnerRoleName " +
      "AND u.created_at >= :reportDateStart AND u.created_at < :reportDateEnd";

  // Native query for bulk upsert using MySQL ON DUPLICATE KEY UPDATE
  public static final String UPSERT_SYSTEM_DAILY_REPORT = "INSERT INTO " + DbTableNames.SYSTEM_DAILY_REPORTS + " " +
      "(report_date, gross_revenue, net_revenue, total_bookings_created, total_bookings_completed, " +
      "total_bookings_cancelled, new_customers_registered, new_partners_registered, " +
      "system_average_review_score, total_reviews, updated_at) " +
      "VALUES (:reportDate, :grossRevenue, :netRevenue, :totalBookingsCreated, :totalBookingsCompleted, " +
      ":totalBookingsCancelled, :newCustomersRegistered, :newPartnersRegistered, " +
      ":systemAverageReviewScore, :totalReviews, :updatedAt) " +
      "ON DUPLICATE KEY UPDATE " +
      "gross_revenue = VALUES(gross_revenue), " +
      "net_revenue = VALUES(net_revenue), " +
      "total_bookings_created = VALUES(total_bookings_created), " +
      "total_bookings_completed = VALUES(total_bookings_completed), " +
      "total_bookings_cancelled = VALUES(total_bookings_cancelled), " +
      "new_customers_registered = VALUES(new_customers_registered), " +
      "new_partners_registered = VALUES(new_partners_registered), " +
      "system_average_review_score = VALUES(system_average_review_score), " +
      "total_reviews = VALUES(total_reviews), " +
      "updated_at = VALUES(updated_at)";
}
