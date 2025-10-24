package com.webapp.holidate.service.booking;

import com.webapp.holidate.repository.booking.discount.DiscountRepository;
import com.webapp.holidate.repository.booking.discount.HotelDiscountRepository;
import com.webapp.holidate.repository.booking.discount.SpecialDayDiscountRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DiscountService {
  DiscountRepository discountRepository;
  HotelDiscountRepository hotelDiscountRepository;
  SpecialDayDiscountRepository specialDayDiscountRepository;


}
