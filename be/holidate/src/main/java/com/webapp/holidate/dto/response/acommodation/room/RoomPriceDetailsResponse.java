package com.webapp.holidate.dto.response.acommodation.room;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class RoomPriceDetailsResponse {
  LocalDate date;
  double originalPrice;
  double priceAfterDiscount;
  double vatFee;
  double serviceFee;
  double finalPrice;
}
