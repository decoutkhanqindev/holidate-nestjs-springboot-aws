package com.webapp.holidate.dto.request.acommodation.room;

import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
public class RoomCreationRequest {
  @NotBlank(message = "HOTEL_ID_NOT_BLANK")
  String hotelId;

  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  @NotBlank(message = "VIEW_NOT_BLANK")
  String view;

  @Positive(message = "AREA_MUST_BE_POSITIVE")
  double area;

  @NotEmpty(message = "PHOTOS_NOT_EMPTY")
  List<PhotoCreationRequest> photos;

  @Positive(message = "MAX_ADULTS_MUST_BE_POSITIVE")
  int maxAdults;

  @PositiveOrZero(message = "MAX_CHILDREN_MUST_BE_POSITIVE_OR_ZERO")
  int maxChildren;

  @Positive(message = "BASE_PRICE_PER_NIGHT_MUST_BE_POSITIVE")
  double basePricePerNight;

  @NotBlank(message = "BED_TYPE_ID_NOT_BLANK")
  String bedTypeId;

  boolean smokingAllowed;
  boolean wifiAvailable;
  boolean breakfastIncluded;

  @Positive(message = "QUANTITY_MUST_BE_POSITIVE")
  int quantity;

  @NotEmpty(message = "AMENITY_IDS_NOT_EMPTY")
  List<String> amenityIds;
}