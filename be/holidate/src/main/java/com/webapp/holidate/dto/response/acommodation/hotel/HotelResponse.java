package com.webapp.holidate.dto.response.acommodation.hotel;

import com.webapp.holidate.dto.response.image.PhotoResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.user.UserResponse;
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
  List<PhotoResponse> photos;
  double latitude;
  double longitude;
  int starRating;
  double averageScore;
  boolean allowsPayAtHotel;
  UserResponse partner;
  String status;
  double rawPricePerNight;
  double currentPricePerNight;
  int availableRooms;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}