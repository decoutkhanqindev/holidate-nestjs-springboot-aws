package com.webapp.holidate.dto.response.booking;

import com.webapp.holidate.entity.booking.discount.Discount;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
  double percentage; // e.g., 10.0 for a 10% discount
  int usageLimit;
  int timesUsed;
  int minBookingPrice;
  int minBookingCount;
  LocalDate validFrom;
  LocalDate validTo;
  boolean active;
}
