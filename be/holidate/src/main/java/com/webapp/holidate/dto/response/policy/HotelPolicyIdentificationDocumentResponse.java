package com.webapp.holidate.dto.response.policy;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class HotelPolicyIdentificationDocumentResponse {
  String id;
  String name;
}