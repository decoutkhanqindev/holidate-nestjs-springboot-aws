package com.webapp.holidate.entity.discount;

import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = DbTableNames.DISCOUNTS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Discount {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @Column(nullable = false, unique = true)
  String code;

  @Column(nullable = false, columnDefinition = "TEXT")
  String description;

  @Column(nullable = false)
  double percentage; // e.g., 10.0 for a 10% discount

  @Column(nullable = false)
  int usageLimit;

  @Column(nullable = false)
  @Builder.Default
  int timesUsed = 0;

  @Column(nullable = false)
  int minBookingPrice;

  @Column(nullable = false)
  int minBookingCount;

  @Column(nullable = false)
  LocalDate validFrom;

  @Column(nullable = false)
  LocalDate validTo;

  @Column(nullable = false)
  @Builder.Default
  boolean active = true;
}
