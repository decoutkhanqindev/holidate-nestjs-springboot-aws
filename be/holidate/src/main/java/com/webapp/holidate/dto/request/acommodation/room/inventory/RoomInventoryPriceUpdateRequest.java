package com.webapp.holidate.dto.request.acommodation.room.inventory;

import jakarta.validation.constraints.NotBlank;
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
public class RoomInventoryPriceUpdateRequest {
  @NotBlank(message = "ROOM_ID_NOT_BLANK")
  String roomId;

  @NotBlank(message = "START_DATE_NOT_BLANK")
  LocalDate startDate;

  @NotBlank(message = "END_DATE_NOT_BLANK")
  LocalDate endDate;

  @NotBlank(message = "PRICE_NOT_BLANK")
  @Positive(message = "PRICE_MUST_BE_POSITIVE")
  Double price;
}
