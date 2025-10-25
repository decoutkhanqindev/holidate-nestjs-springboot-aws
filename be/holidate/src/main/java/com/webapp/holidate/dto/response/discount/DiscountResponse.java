package com.webapp.holidate.dto.response.discount;

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
public class DiscountResponse {
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
}
