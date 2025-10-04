package com.webapp.holidate.entity.image;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.HOTEL_PHOTOS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class HotelPhoto {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.HOTEL_ID, nullable = false)
  @ToString.Exclude
  Hotel hotel;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.PHOTO_ID, nullable = false)
  @ToString.Exclude
  Photo photo;
}
