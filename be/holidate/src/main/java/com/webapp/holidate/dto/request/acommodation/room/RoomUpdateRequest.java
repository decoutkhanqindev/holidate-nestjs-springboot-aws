package com.webapp.holidate.dto.request.acommodation.room;

import com.webapp.holidate.constants.ValidationPatterns;
import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
public class RoomUpdateRequest {
  String name;
  String view;

  @Positive(message = "AREA_MUST_BE_POSITIVE")
  Double area;

  List<PhotoCreationRequest> photosToAdd;
  List<String> photoIdsToDelete;

  @Positive(message = "MAX_ADULTS_MUST_BE_POSITIVE")
  Integer maxAdults;

  @PositiveOrZero(message = "MAX_CHILDREN_MUST_BE_POSITIVE_OR_ZERO")
  Integer maxChildren;

  @Positive(message = "PRICE_MUST_BE_POSITIVE")
  Double basePricePerNight;

  String bedTypeId;

  Boolean smokingAllowed;
  Boolean wifiAvailable;
  Boolean breakfastIncluded;

  @Positive(message = "QUANTITY_MUST_BE_POSITIVE")
  Integer quantity;

  List<String> amenityIdsToAdd;
  List<String> amenityIdsToRemove;

  String cancellationPolicyId;
  String reschedulePolicyId;

  @Pattern(regexp = ValidationPatterns.ACCOMMODATION_STATUS, message = "ROOM_STATUS_INVALID")
  String status;
}