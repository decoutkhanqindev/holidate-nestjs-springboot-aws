package com.webapp.holidate.repository.discount;

import com.webapp.holidate.entity.discount.HotelDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelDiscountRepository extends JpaRepository<HotelDiscount, String> {
}