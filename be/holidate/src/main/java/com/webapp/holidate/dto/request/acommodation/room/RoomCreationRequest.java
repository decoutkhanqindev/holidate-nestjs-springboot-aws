package com.webapp.holidate.dto.request.acommodation.room;

import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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

  @NotBlank(message = "AREA_NOT_BLANK")
  double area;

  @NotBlank(message = "PHOTOS_NOT_BLANK")
  List<PhotoCreationRequest> photos;

  @NotBlank(message = "MAX_ADULTS_NOT_BLANK")
  int maxAdults;

  @NotBlank(message = "MAX_CHILDREN_NOT_BLANK")
  int maxChildren;

  @NotBlank(message = "BASE_PRICE_PER_NIGHT_NOT_BLANK")
  double basePricePerNight;

  @NotBlank(message = "BED_TYPE_ID_NOT_BLANK")
  String bedTypeId;

  @NotBlank(message = "SMOKING_ALLOWED_NOT_BLANK")
  boolean smokingAllowed;

  @NotBlank(message = "WIFI_AVAILABLE_NOT_BLANK")
  boolean wifiAvailable;

  @NotBlank(message = "BREAKFAST_INCLUDED_NOT_BLANK")
  boolean breakfastIncluded;

  @NotBlank(message = "QUANTITY_NOT_BLANK")
  int quantity;

  @NotEmpty(message = "AMENITY_IDS_NOT_EMPTY")
  List<String> amenityIds;
}