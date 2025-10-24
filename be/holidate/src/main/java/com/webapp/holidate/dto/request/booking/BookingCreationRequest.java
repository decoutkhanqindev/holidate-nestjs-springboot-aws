package com.webapp.holidate.dto.request.booking;

import com.webapp.holidate.constants.ValidationPatterns;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class BookingCreationRequest {
  @NotBlank(message = "USER_ID_NOT_BLANK")
  String userId;

  @NotBlank(message = "ROOM_ID_NOT_BLANK")
  String roomId;

  @NotBlank(message = "HOTEL_ID_NOT_BLANK")
  String hotelId;

  @NotBlank(message = "CHECK_IN_OUT_DATE_NOT_BLANK")
  @Pattern(regexp = ValidationPatterns.CHECK_IN_OUT_TIME, message = "CHECK_IN_OUT_TIME_INVALID")
  LocalDate checkInDate;

  @NotBlank(message = "CHECK_IN_OUT_DATE_NOT_BLANK")
  @Pattern(regexp = ValidationPatterns.CHECK_IN_OUT_TIME, message = "CHECK_IN_OUT_TIME_INVALID")
  LocalDate checkOutDate;

  @NotBlank(message = "NUMBER_OF_NIGHTS_NOT_BLANK")
  @Positive(message = "NUMBER_OF_NIGHTS_MUST_BE_POSITIVE")
  int numberOfNights;

  @NotBlank(message = "NUMBER_OF_ROOMS_NOT_BLANK")
  @Positive(message = "NUMBER_OF_ROOMS_MUST_BE_POSITIVE")
  int numberOfRooms;

  @NotBlank(message = "NUMBER_OF_ADULTS_NOT_BLANK")
  @Positive(message = "NUMBER_OF_ADULTS_MUST_BE_POSITIVE")
  int numberOfAdults;

  @NotBlank(message = "NUMBER_OF_CHILDREN_NOT_BLANK")
  @Positive(message = "NUMBER_OF_CHILDREN_MUST_BE_POSITIVE")
  int numberOfChildren;

  String discountCode;

  @NotBlank(message = "CONTACT_FULL_NAME_NOT_BLANK")
  String contactFullName;

  @NotBlank(message = "CONTACT_EMAIL_NOT_BLANK")
  String contactEmail;

  @NotBlank(message = "CONTACT_PHONE_NOT_BLANK")
  String contactPhone;
}
