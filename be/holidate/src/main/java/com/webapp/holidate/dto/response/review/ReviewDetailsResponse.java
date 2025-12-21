package com.webapp.holidate.dto.response.review;

import com.webapp.holidate.dto.response.acommodation.hotel.HotelBriefResponse;
import com.webapp.holidate.dto.response.booking.BookingBriefResponse;
import com.webapp.holidate.dto.response.image.PhotoResponse;
import com.webapp.holidate.dto.response.user.UserBriefResponse;
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
public class ReviewDetailsResponse {
  String id;
  UserBriefResponse user;
  HotelBriefResponse hotel;
  BookingBriefResponse booking;
  int score;
  String comment;
  List<PhotoResponse> photos;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
