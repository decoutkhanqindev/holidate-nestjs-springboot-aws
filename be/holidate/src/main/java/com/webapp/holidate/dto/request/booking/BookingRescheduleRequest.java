package com.webapp.holidate.dto.request.booking;

import jakarta.validation.constraints.NotNull;
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
public class BookingRescheduleRequest {
  @NotNull(message = "CHECK_IN_OUT_DATE_NOT_BLANK")
  LocalDate newCheckInDate;

  @NotNull(message = "CHECK_IN_OUT_DATE_NOT_BLANK")
  LocalDate newCheckOutDate;
}
