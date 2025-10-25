package com.webapp.holidate.dto.request.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class DiscountCreationRequest {
  @NotBlank(message = "DISCOUNT_CODE_NOT_BLANK")
  String code;

  @NotNull(message = "DISCOUNT_PERCENTAGE_NOT_BLANK")
  @Positive(message = "DISCOUNT_PERCENTAGE_POSITIVE")
  double percentage; // e.g., 10.0 for a 10% discount

  @NotNull(message = "USAGE_LIMIT_NOT_BLANK")
  @Positive(message = "USAGE_LIMIT_POSITIVE")
  int usageLimit;

  @NotNull(message = "TIMES_USED_NOT_BLANK")
  @Positive(message = "TIMES_USED_POSITIVE")
  int timesUsed;

  @Positive(message = "MIN_BOOKING_PRICE_POSITIVE")
  int minBookingPrice;

  @Positive(message = "MIN_BOOKING_COUNT_POSITIVE")
  int minBookingCount;

  @NotNull(message = "VALID_FROM_TO_DATE_NOT_BLANK")
  LocalDate validFrom;

  @NotNull(message = "VALID_FROM_TO_DATE_NOT_BLANK")
  LocalDate validTo;
}
