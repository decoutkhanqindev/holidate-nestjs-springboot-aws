package com.webapp.holidate.entity.booking;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.image.ReviewPhoto;
import com.webapp.holidate.entity.user.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = DbTableNames.REVIEWS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Review {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.HOTEL_ID, nullable = false)
  @ToString.Exclude
  Hotel hotel;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.USER_ID, nullable = false)
  @ToString.Exclude
  User user;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.BOOKING_ID, nullable = false)
  @ToString.Exclude
  Booking booking;

  @Column(nullable = false)
  int score; // 1-10

  @Column(nullable = true, columnDefinition = "TEXT")
  String comment;

  @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @ToString.Exclude
  @Builder.Default
  Set<ReviewPhoto> photos = new HashSet<>();

  @Column(nullable = false)
  @Builder.Default
  LocalDateTime createdAt = LocalDateTime.now();

  @Column(nullable = true)
  LocalDateTime updatedAt;
}