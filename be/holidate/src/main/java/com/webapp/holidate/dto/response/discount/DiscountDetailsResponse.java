package com.webapp.holidate.dto.response.discount;

import com.webapp.holidate.dto.response.acommodation.hotel.HotelBriefResponse;
import com.webapp.holidate.dto.response.special_day.SpecialDayResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class DiscountDetailsResponse {
  String id;
  String code;
  String description;
  double percentage; // e.g., 10.0 for a 10% discount
  int usageLimit;
  int timesUsed;
  int minBookingPrice;
  int minBookingCount;
  LocalDate validFrom;
  LocalDate validTo;
  boolean active;
  HotelBriefResponse hotel;
  SpecialDayResponse specialDay;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
