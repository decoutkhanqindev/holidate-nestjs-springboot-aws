package com.webapp.holidate.dto.response.policy;

import com.webapp.holidate.dto.response.policy.cancellation.CancellationPolicyResponse;
import com.webapp.holidate.dto.response.policy.reschedule.ReschedulePolicyResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class HotelPolicyResponse {
  String id;
  LocalTime checkInTime;
  LocalTime checkOutTime;
  boolean allowsPayAtHotel;
  List<HotelPolicyIdentificationDocumentResponse> requiredIdentificationDocuments;
  CancellationPolicyResponse cancellationPolicy;
  ReschedulePolicyResponse reschedulePolicy;
}