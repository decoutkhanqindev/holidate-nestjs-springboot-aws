package com.webapp.holidate.dto.request.policy;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;
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
public class HotelPolicyRequest {
  @NotNull(message = "CHECK_IN_OUT_TIME_INVALID")
  LocalTime checkInTime;

  @NotNull(message = "CHECK_IN_OUT_TIME_INVALID")
  LocalTime checkOutTime;

  Boolean allowsPayAtHotel;
  List<String> requiredIdentificationDocumentIdsToAdd;
  List<String> requiredIdentificationDocumentIdsToRemove;
  String cancellationPolicyId;
  String reschedulePolicyId;
}
