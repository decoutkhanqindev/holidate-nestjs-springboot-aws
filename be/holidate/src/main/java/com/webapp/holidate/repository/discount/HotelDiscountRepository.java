package com.webapp.holidate.repository.discount;

import com.webapp.holidate.constants.db.query.DiscountQueries;
import com.webapp.holidate.entity.discount.HotelDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HotelDiscountRepository extends JpaRepository<HotelDiscount, String> {
  @Query(DiscountQueries.FIND_BY_DISCOUNT_ID_WITH_HOTEL)
  Optional<HotelDiscount> findByDiscountId(String discountId);
}