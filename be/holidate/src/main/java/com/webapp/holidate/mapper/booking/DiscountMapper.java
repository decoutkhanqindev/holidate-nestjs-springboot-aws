package com.webapp.holidate.mapper.booking;

import com.webapp.holidate.dto.request.booking.discount.DiscountCreationRequest;
import com.webapp.holidate.dto.response.booking.DiscountResponse;
import com.webapp.holidate.entity.booking.discount.Discount;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DiscountMapper {
  Discount toEntity(DiscountCreationRequest request);
  DiscountResponse toDiscountResponse(Discount discount);
}
