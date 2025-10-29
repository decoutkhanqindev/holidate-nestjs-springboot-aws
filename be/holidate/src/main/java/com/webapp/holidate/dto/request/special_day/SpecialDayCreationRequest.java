package com.webapp.holidate.dto.request.special_day;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class SpecialDayCreationRequest {
  @NotNull(message = "SPECIAL_DAY_DATE_NOT_BLANK")
  LocalDate date;

  @NotBlank(message = "NAME_NOT_BLANK")
  String name;
}
