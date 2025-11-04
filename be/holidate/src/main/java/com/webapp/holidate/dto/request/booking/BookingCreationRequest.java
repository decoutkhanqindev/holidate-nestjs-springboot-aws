package com.webapp.holidate.dto.request.booking;

import com.webapp.holidate.constants.ValidationPatterns;
import jakarta.validation.constraints.*;
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

  @NotNull(message = "CHECK_IN_OUT_DATE_NOT_BLANK")
  LocalDate checkInDate;

  @NotNull(message = "CHECK_IN_OUT_DATE_NOT_BLANK")
  LocalDate checkOutDate;

  @NotNull(message = "NUMBER_OF_ROOMS_NOT_BLANK")
  @Positive(message = "NUMBER_OF_ROOMS_MUST_BE_POSITIVE")
  Integer numberOfRooms;

  @NotNull(message = "NUMBER_OF_ADULTS_NOT_BLANK")
  @Positive(message = "NUMBER_OF_ADULTS_MUST_BE_POSITIVE")
  Integer numberOfAdults;

  @NotNull(message = "NUMBER_OF_CHILDREN_NOT_BLANK")
  @Min(value = 0, message = "NUMBER_OF_CHILDREN_MUST_BE_POSITIVE_OR_ZERO")
  @Builder.Default
  Integer numberOfChildren = 0;

  String discountCode;

  @NotBlank(message = "CONTACT_FULL_NAME_NOT_BLANK")
  String contactFullName;

  @NotBlank(message = "CONTACT_EMAIL_NOT_BLANK")
  @Email(message = "CONTACT_EMAIL_INVALID")
  String contactEmail;

  @NotBlank(message = "CONTACT_PHONE_NOT_BLANK")
  @Pattern(regexp = ValidationPatterns.PHONE_NUMBER, message = "CONTACT_PHONE_INVALID")
  String contactPhone;
}
