package com.webapp.holidate.mapper.discount;

import com.webapp.holidate.dto.request.discount.DiscountCreationRequest;
import com.webapp.holidate.dto.request.discount.DiscountUpdateRequest;
import com.webapp.holidate.dto.response.discount.DiscountDetailsResponse;
import com.webapp.holidate.dto.response.discount.DiscountResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.discount.Discount;
import com.webapp.holidate.entity.discount.HotelDiscount;
import com.webapp.holidate.entity.discount.SpecialDayDiscount;
import com.webapp.holidate.entity.special_day.SpecialDay;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DiscountMapper {
  @Mapping(target = "id", ignore = true)
  Discount toEntity(DiscountCreationRequest request);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
  Discount toEntity(DiscountUpdateRequest request);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
  void updateEntity(DiscountUpdateRequest request, @MappingTarget Discount entity);

  @Mapping(target = "id", ignore = true)
  HotelDiscount toEntity(Discount discount, Hotel hotel);

  @Mapping(target = "id", ignore = true)
  SpecialDayDiscount toEntity(Discount discount, SpecialDay specialDay);

  DiscountResponse toDiscountResponse(Discount discount);

  DiscountDetailsResponse toDiscountDetailsResponse(Discount discount);
}
