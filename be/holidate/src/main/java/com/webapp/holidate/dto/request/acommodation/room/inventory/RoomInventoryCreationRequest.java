package com.webapp.holidate.dto.request.acommodation.room.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
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
public class RoomInventoryCreationRequest {
  @NotBlank(message = "ROOM_ID_NOT_BLANK")
  String roomId;

  @Positive(message = "DAYS_MUST_BE_POSITIVE")
  int days;
}
