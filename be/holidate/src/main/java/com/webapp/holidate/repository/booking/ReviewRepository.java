package com.webapp.holidate.repository.booking;

import com.webapp.holidate.constants.db.query.booking.ReviewQueries;
import com.webapp.holidate.entity.booking.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.Nullable;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, String> {
  @Query(ReviewQueries.FIND_ALL_WITH_FILTERS_PAGED)
  Page<Review> findAllWithFiltersPaged(
      @Nullable String hotelId,
      @Nullable String userId,
      @Nullable String bookingId,
      @Nullable Integer minScore,
      @Nullable Integer maxScore,
      Pageable pageable);

  @Query(ReviewQueries.FIND_BY_ID_WITH_DETAILS)
  Optional<Review> findByIdWithDetails(String id);
}
