package com.webapp.holidate.dto.request.discount;

import jakarta.validation.constraints.*;
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
public class DiscountUpdateRequest {
  @Size(max = 50, message = "DISCOUNT_CODE_TOO_LONG")
  String code;

  @Size(max = 500, message = "DISCOUNT_DESCRIPTION_TOO_LONG")
  String description;

  @DecimalMin(value = "0.0", message = "DISCOUNT_PERCENTAGE_INVALID")
  @DecimalMax(value = "100.0", message = "DISCOUNT_PERCENTAGE_INVALID")
  Double percentage; // e.g., 10.0 for a 10% discount

  @Positive(message = "USAGE_LIMIT_POSITIVE")
  Integer usageLimit;

  @PositiveOrZero(message = "TIMES_USED_POSITIVE")
  Integer timesUsed;

  @PositiveOrZero(message = "MIN_BOOKING_PRICE_POSITIVE")
  Integer minBookingPrice;

  @Positive(message = "MIN_BOOKING_COUNT_POSITIVE")
  Integer minBookingCount;

  LocalDate validFrom;

  LocalDate validTo;

  Boolean active;

  String hotelId;

  String specialDayId;
}
