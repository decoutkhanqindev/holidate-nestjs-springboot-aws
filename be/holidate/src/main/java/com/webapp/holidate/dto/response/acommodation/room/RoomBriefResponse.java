package com.webapp.holidate.dto.response.acommodation.room;

import com.webapp.holidate.dto.response.amenity.AmenityCategoryDetailsResponse;
import com.webapp.holidate.dto.response.image.PhotoCategoryResponse;
import com.webapp.holidate.dto.response.policy.cancellation.CancellationPolicyResponse;
import com.webapp.holidate.dto.response.policy.reschedule.ReschedulePolicyResponse;
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
public class RoomBriefResponse {
  String id;
  String name;
  String view;
  double area;
  int maxAdults;
  int maxChildren;
  double basePricePerNight;
  double currentPricePerNight;
  BedTypeResponse bedType;
  CancellationPolicyResponse cancellationPolicy;
  ReschedulePolicyResponse reschedulePolicy;
  boolean smokingAllowed;
  boolean wifiAvailable;
  boolean breakfastIncluded;
}