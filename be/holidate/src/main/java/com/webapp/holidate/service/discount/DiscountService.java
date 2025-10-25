package com.webapp.holidate.service.discount;

import com.webapp.holidate.dto.request.discount.DiscountCreationRequest;
import com.webapp.holidate.dto.response.discount.DiscountResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.discount.Discount;
import com.webapp.holidate.entity.discount.HotelDiscount;
import com.webapp.holidate.entity.discount.SpecialDayDiscount;
import com.webapp.holidate.entity.special_day.SpecialDay;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.discount.DiscountMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.discount.DiscountRepository;
import com.webapp.holidate.repository.discount.HotelDiscountRepository;
import com.webapp.holidate.repository.discount.SpecialDayDiscountRepository;
import com.webapp.holidate.repository.special_day.SpecialDayRepository;
import com.webapp.holidate.type.ErrorType;
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
  HotelRepository hotelRepository;

  SpecialDayDiscountRepository specialDayDiscountRepository;
  SpecialDayRepository specialDayRepository;

  DiscountMapper mapper;

  public DiscountResponse create(DiscountCreationRequest request, String hotelId, String specialDayId) {
    if (discountRepository.existsByCode(request.getCode())) {
      throw new AppException(ErrorType.DISCOUNT_EXISTS);
    }

    Discount discount = mapper.toEntity(request);
    discountRepository.save(discount);

    if (hotelId != null) {
      Hotel hotel = hotelRepository.findById(hotelId)
        .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));
      HotelDiscount hotelDiscount = mapper.toEntity(discount, hotel);
      hotelDiscountRepository.save(hotelDiscount);
    }

    if (specialDayId != null) {
      SpecialDay specialDay = specialDayRepository.findById(specialDayId)
        .orElseThrow(() -> new AppException(ErrorType.SPECIAL_DAY_NOT_FOUND));
      SpecialDayDiscount specialDayDiscount = mapper.toEntity(discount, specialDay);
      specialDayDiscountRepository.save(specialDayDiscount);
    }

    return mapper.toDiscountResponse(discount);
  }

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
