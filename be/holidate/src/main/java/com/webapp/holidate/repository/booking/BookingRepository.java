package com.webapp.holidate.repository.booking;

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

  // Count confirmed bookings for a user (excluding cancelled bookings)
  long countByUserIdAndStatusIn(String userId, List<String> statuses);

  // Find booking by ID with all related entities loaded
  @Query(BookingQueries.FIND_BY_ID_WITH_ALL_RELATIONS)
  Optional<Booking> findByIdWithAllRelations(String id);

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
}
