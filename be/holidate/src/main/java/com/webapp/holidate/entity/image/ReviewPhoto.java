package com.webapp.holidate.entity.image;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.booking.Review;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.REVIEW_PHOTOS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ReviewPhoto {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.REVIEW_ID, nullable = false)
  @ToString.Exclude
  Review review;

  @Column(nullable = false, columnDefinition = "TEXT")
  String url;
}