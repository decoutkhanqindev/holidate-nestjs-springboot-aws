package com.webapp.holidate.repository.booking.discount;

import com.webapp.holidate.entity.booking.discount.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, String> {
  Optional<Discount> findByCode(String code);
}