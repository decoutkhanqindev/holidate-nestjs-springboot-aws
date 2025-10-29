package com.webapp.holidate.dto.response.booking;

import com.webapp.holidate.dto.response.discount.DiscountBriefResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class BookingPriceDetailsResponse {
  double originalPrice;
  double discountAmount;
  DiscountBriefResponse appliedDiscount;
  double netPriceAfterDiscount;
  FeeResponse tax;
  FeeResponse serviceFee;
  double finalPrice;
}
