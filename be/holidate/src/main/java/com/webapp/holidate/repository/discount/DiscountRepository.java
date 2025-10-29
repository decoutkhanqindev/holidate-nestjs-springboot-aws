package com.webapp.holidate.repository.discount;

import com.webapp.holidate.constants.db.query.DiscountQueries;
import com.webapp.holidate.entity.discount.Discount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, String> {
  boolean existsByCode(String code);

  Optional<Discount> findByCode(String code);

  @Query(DiscountQueries.FIND_ALL_WITH_FILTERS)
  Page<Discount> findAllWithFilters(
    @Nullable String code,
    @Nullable Boolean active,
    @Nullable Boolean currentlyValid,
    @Nullable LocalDate validFrom,
    @Nullable LocalDate validTo,
    @Nullable Double minPercentage,
    @Nullable Double maxPercentage,
    @Nullable Integer minBookingPrice,
    @Nullable Integer maxBookingPrice,
    @Nullable Integer minBookingCount,
    @Nullable Integer maxBookingCount,
    @Nullable Boolean available,
    @Nullable Boolean exhausted,
    @Nullable Integer minTimesUsed,
    @Nullable Integer maxTimesUsed,
    @Nullable String hotelId,
    @Nullable String specialDayId,
    Pageable pageable);

  @Query(DiscountQueries.FIND_BY_ID_WITH_DETAILS)
  Optional<Discount> findByIdWithDetails(String id);
}