package com.webapp.holidate.repository.discount;

import com.webapp.holidate.entity.discount.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, String> {
  boolean existsByCode(String code);
  Optional<Discount> findByCode(String code);
}