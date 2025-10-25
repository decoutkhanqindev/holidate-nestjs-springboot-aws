package com.webapp.holidate.dto.request.booking.discount;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class DiscountCreationRequest {
  @NotBlank(message = "DISCOUNT_CODE_NOT_BLANK")
  String code;

  @NotNull(message = "DISCOUNT_PERCENTAGE_NOT_BLANK")
  @Positive(message = "DISCOUNT_PERCENTAGE_POSITIVE")
  Double percentage; // e.g., 10.0 for a 10% discount

  @NotNull(message = "USAGE_LIMIT_NOT_BLANK")
  @Positive(message = "USAGE_LIMIT_POSITIVE")
  Integer usageLimit;

  @NotNull(message = "TIMES_USED_NOT_BLANK")
  @Positive(message = "TIMES_USED_POSITIVE")
  Integer timesUsed;

  @Positive(message = "MIN_BOOKING_PRICE_POSITIVE")
  Integer minBookingPrice;

  @Positive(message = "MIN_BOOKING_COUNT_POSITIVE")
  Integer minBookingCount;

  @NotNull(message = "VALID_FROM_TO_DATE_NOT_BLANK")
  LocalDate validFrom;

  @NotNull(message = "VALID_FROM_TO_DATE_NOT_BLANK")
  LocalDate validTo;
}
