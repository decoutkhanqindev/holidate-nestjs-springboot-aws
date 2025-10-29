package com.webapp.holidate.dto.response.acommodation.hotel;

import com.webapp.holidate.dto.response.image.PhotoCategoryResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.policy.HotelPolicyResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class HotelResponse {
  String id;
  String name;
  String description;
  String address;
  LocationResponse country;
  LocationResponse province;
  LocationResponse city;
  LocationResponse district;
  LocationResponse ward;
  LocationResponse street;
  List<PhotoCategoryResponse> photos;
  double latitude;
  double longitude;
  int starRating;
  HotelPolicyResponse policy;
  String status;
  double rawPricePerNight;
  double currentPricePerNight;
  int availableRooms;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}