package com.webapp.holidate.dto.request.booking;

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
public class BookingPricePreviewRequest {
  String roomId;
  LocalDate startDate;
  LocalDate endDate;
  Integer roomCount;
  String discountCode;
}
