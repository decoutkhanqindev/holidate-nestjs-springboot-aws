package com.webapp.holidate.dto.response.booking;

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
public class BookingPricePreviewResponse {
  double subtotal;
  double discountAmount;
  String appliedDiscountCode;
  double netPriceAfterDiscount;
  double tax;
  double serviceFee;
  double finalTotalPrice;
}
