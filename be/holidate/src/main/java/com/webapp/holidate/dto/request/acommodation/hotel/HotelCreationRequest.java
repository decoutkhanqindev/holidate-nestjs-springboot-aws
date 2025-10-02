package com.webapp.holidate.dto.request.acommodation.hotel;

import com.webapp.holidate.constants.ValidationPatterns;
import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class HotelCreationRequest {
  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  @NotBlank(message = "DESCRIPTION_NOT_BLANK")
  String description;

  @NotBlank(message = "ADDRESS_NOT_BLANK")
  String address;

  @NotBlank(message = "COUNTRY_ID_NOT_BLANK")
  String countryId;

  @NotBlank(message = "PROVINCE_ID_NOT_BLANK")
  String provinceId;

  @NotBlank(message = "CITY_ID_NOT_BLANK")
  String cityId;

  @NotBlank(message = "DISTRICT_ID_NOT_BLANK")
  String districtId;

  @NotBlank(message = "WARD_ID_NOT_BLANK")
  String wardId;

  @NotBlank(message = "STREET_ID_NOT_BLANK")
  String streetId;

  @NotBlank(message = "PARTNER_ID_NOT_BLANK")
  String partnerId;
}