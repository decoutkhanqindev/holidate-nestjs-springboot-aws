package com.webapp.holidate.dto.request.acommodation.room;

import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import jakarta.validation.constraints.*;
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
public class RoomCreationRequest {
  @NotBlank(message = "HOTEL_ID_NOT_BLANK")
  String hotelId;

  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  @NotBlank(message = "VIEW_NOT_BLANK")
  String view;

  @NotNull(message = "AREA_NOT_BLANK")
  @Positive(message = "AREA_MUST_BE_POSITIVE")
  Double area;

  @NotEmpty(message = "PHOTOS_NOT_EMPTY")
  List<PhotoCreationRequest> photos;

  @NotNull(message = "MAX_ADULTS_NOT_BLANK")
  @Positive(message = "MAX_ADULTS_MUST_BE_POSITIVE")
  Integer maxAdults;

  @NotNull(message = "MAX_CHILDREN_NOT_BLANK")
  @PositiveOrZero(message = "MAX_CHILDREN_MUST_BE_POSITIVE_OR_ZERO")
  Integer maxChildren;

  @NotNull(message = "PRICE_NOT_BLANK")
  @Positive(message = "PRICE_MUST_BE_POSITIVE")
  Double basePricePerNight;

  @NotBlank(message = "BED_TYPE_ID_NOT_BLANK")
  String bedTypeId;

  Boolean smokingAllowed;
  Boolean wifiAvailable;
  Boolean breakfastIncluded;

  @NotNull(message = "QUANTITY_NOT_BLANK")
  @Positive(message = "QUANTITY_MUST_BE_POSITIVE")
  Integer quantity;

  @NotEmpty(message = "AMENITY_IDS_NOT_EMPTY")
  List<String> amenityIds;
}