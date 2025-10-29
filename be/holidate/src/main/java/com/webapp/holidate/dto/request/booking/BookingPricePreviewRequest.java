package com.webapp.holidate.dto.request.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class BookingPricePreviewRequest {
  @NotBlank(message = "ROOM_ID_NOT_BLANK")
  String roomId;

  @NotNull(message = "START_DATE_NOT_BLANK")
  LocalDate startDate;

  @NotNull(message = "END_DATE_NOT_BLANK")
  LocalDate endDate;

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
}
