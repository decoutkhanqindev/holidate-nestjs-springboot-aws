package com.webapp.holidate.entity.accommodation.amenity;

import com.webapp.holidate.constants.db.DbFieldNames;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Embeddable
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class HotelAmenityId implements Serializable {
  @Column(name = DbFieldNames.HOTEL_ID, nullable = false)
  String hotelId;

  @Column(name = DbFieldNames.AMENITY_ID, nullable = false)
  String amenityId;
}