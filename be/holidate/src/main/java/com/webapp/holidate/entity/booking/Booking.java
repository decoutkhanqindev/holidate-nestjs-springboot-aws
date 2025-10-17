package com.webapp.holidate.entity.booking;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.booking.discount.Discount;
import com.webapp.holidate.entity.user.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = DbTableNames.BOOKINGS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Booking {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.USER_ID, nullable = false)
  @ToString.Exclude
  User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.ROOM_ID, nullable = false)
  @ToString.Exclude
  Room room;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.HOTEL_ID, nullable = false)
  @ToString.Exclude
  Hotel hotel;

  @Column(nullable = false)
  LocalDate checkInDate;

  @Column(nullable = false)
  LocalDate checkOutDate;

  @Column(nullable = false)
  int numberOfAdults;

  @Column(nullable = false)
  @Builder.Default
  int numberOfChildren = 0;

  @Column(nullable = false)
  double originalPrice;

  @Column(nullable = true)
  double discountAmount;

  @Column(nullable = false)
  double finalPrice;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.DISCOUNT_ID, nullable = true)
  @ToString.Exclude
  Discount appliedDiscount;

  @Column(nullable = false)
  String contactFullName;

  @Column(nullable = false)
  String contactEmail;

  @Column(nullable = false)
  String contactPhone;

  @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
  @ToString.Exclude
  Payment payment;

  @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
  @ToString.Exclude
  Review review;

  @Column(nullable = false)
  String status;

  @Builder.Default
  @Column(nullable = false)
  LocalDateTime createdAt = LocalDateTime.now();

  @Column
  LocalDateTime updatedAt;
}
