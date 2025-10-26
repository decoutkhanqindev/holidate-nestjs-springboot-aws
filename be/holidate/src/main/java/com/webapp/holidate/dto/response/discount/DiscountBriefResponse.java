package com.webapp.holidate.dto.response.discount;

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
public class DiscountBriefResponse {
  String id;
  String code;
  String description;
  double percentage; // e.g., 10.0 for a 10% discount
  int usageLimit;
  int timesUsed;
}
