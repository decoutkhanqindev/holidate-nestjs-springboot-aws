package com.webapp.holidate.repository.booking.discount;

import com.webapp.holidate.constants.db.query.booking.DiscountQueries;
import com.webapp.holidate.entity.booking.discount.SpecialDayDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecialDayDiscountRepository extends JpaRepository<SpecialDayDiscount, String> {
  @Query(DiscountQueries.FIND_BY_HOLIDAY_ID_WITH_DISCOUNT)
  Optional<SpecialDayDiscount> findByHolidayIdWithDiscount(String holidayId);
}