package com.webapp.holidate.entity.booking;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = DbTableNames.PAYMENTS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Payment {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.BOOKING_ID, nullable = false)
  @ToString.Exclude
  Booking booking;

  @Column(nullable = false)
  double amount;

  @Column(nullable = false)
  String paymentMethod; // only vnpay for now

  @Column(nullable = false)
  String status;

  @Column(nullable = true, unique = true)
  String transactionId;

  @Column(nullable = false)
  @Builder.Default
  LocalDateTime createdAt = LocalDateTime.now();

  @Column
  LocalDateTime completedAt;
}
