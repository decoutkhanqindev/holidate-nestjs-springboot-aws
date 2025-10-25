package com.webapp.holidate.repository.discount;

import com.webapp.holidate.constants.db.query.DiscountQueries;
import com.webapp.holidate.entity.discount.SpecialDayDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecialDayDiscountRepository extends JpaRepository<SpecialDayDiscount, String> {
  @Query(DiscountQueries.FIND_BY_SPECIAL_DAY_ID_WITH_DISCOUNT)
  Optional<SpecialDayDiscount> findBySpecialDayIdWithDiscount(String specialDayId);

  @Query(DiscountQueries.FIND_BY_DISCOUNT_ID_WITH_SPECIAL_DAY)
  Optional<SpecialDayDiscount> findByDiscountId(String discountId);
}