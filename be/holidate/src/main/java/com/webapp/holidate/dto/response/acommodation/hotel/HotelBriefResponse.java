package com.webapp.holidate.dto.response.acommodation.hotel;

import com.webapp.holidate.dto.response.location.LocationResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class HotelBriefResponse {
  String id;
  String name;
  String address;
  LocationResponse country;
  LocationResponse province;
  LocationResponse city;
  LocationResponse district;
  LocationResponse ward;
  LocationResponse street;
  double latitude;
  double longitude;
  int starRating;
  double averageScore;
  String status;
}