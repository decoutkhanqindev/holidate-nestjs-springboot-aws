package com.webapp.holidate.entity.acommodation.amenity;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.acommodation.Hotel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.HOTEL_AMENITIES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class HotelAmenity {
  @EmbeddedId
  HotelAmenityId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId(DbFieldNames.HOTEL_ID_CAMEL)
  @JoinColumn(name = DbFieldNames.HOTEL_ID, nullable = false)
  @ToString.Exclude
  Hotel hotel;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId(DbFieldNames.AMENITY_ID_CAMEL)
  @JoinColumn(name = DbFieldNames.AMENITY_ID, nullable = false)
  @ToString.Exclude
  Amenity amenity;
}