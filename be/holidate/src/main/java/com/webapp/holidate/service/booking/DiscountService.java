package com.webapp.holidate.service.booking;

import com.webapp.holidate.dto.response.booking.DiscountResponse;
import com.webapp.holidate.mapper.booking.DiscountMapper;
import com.webapp.holidate.repository.booking.discount.DiscountRepository;
import com.webapp.holidate.repository.booking.discount.HotelDiscountRepository;
import com.webapp.holidate.repository.booking.discount.SpecialDayDiscountRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DiscountService {
  DiscountRepository discountRepository;
  HotelDiscountRepository hotelDiscountRepository;
  SpecialDayDiscountRepository specialDayDiscountRepository;

  DiscountMapper mapper;

//  public DiscountResponse create(DiscountCreationRequest request){
//
//  }

  public List<DiscountResponse> getAll() {
    return discountRepository.findAll().stream()
      .map(mapper::toDiscountResponse)
      .toList();
  }

  public DiscountResponse getByCode(String code) {
    return discountRepository.findByCode(code)
      .map(mapper::toDiscountResponse)
      .orElse(null);
  }
}
