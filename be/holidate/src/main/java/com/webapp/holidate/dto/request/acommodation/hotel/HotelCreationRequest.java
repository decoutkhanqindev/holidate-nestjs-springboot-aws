package com.webapp.holidate.dto.request.acommodation.hotel;

import com.webapp.holidate.constants.ValidationPatterns;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

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

  List<MultipartFile> photos;

  @NotBlank(message = "PARTNER_ID_NOT_BLANK")
  String partnerId;

  @NotBlank(message = "HOTEL_STATUS_NOT_BLANK")
  @Pattern(regexp = ValidationPatterns.HOTEL_STATUS, message = "HOTEL_STATUS_INVALID")
  String status;
}