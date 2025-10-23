package com.webapp.holidate.dto.response.acommodation.hotel;

import com.webapp.holidate.dto.response.amenity.AmenityCategoryDetailsResponse;
import com.webapp.holidate.dto.response.image.PhotoCategoryResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.entertainment_venue.EntertainmentVenueCategoryResponse;
import com.webapp.holidate.dto.response.policy.HotelPolicyResponse;
import com.webapp.holidate.dto.response.user.PartnerResponse;
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
public class HotelDetailsResponse {
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
  List<EntertainmentVenueCategoryResponse> entertainmentVenues;
  List<PhotoCategoryResponse> photos;
  List<AmenityCategoryDetailsResponse> amenities;
  HotelPolicyResponse policy;
  PartnerResponse partner;
  double latitude;
  double longitude;
  int starRating;
  String status;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}