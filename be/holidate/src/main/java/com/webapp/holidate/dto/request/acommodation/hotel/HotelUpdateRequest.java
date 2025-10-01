package com.webapp.holidate.dto.request.acommodation.hotel;

import com.webapp.holidate.constants.ValidationPatterns;
import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import com.webapp.holidate.dto.request.image.PhotoDeleteRequest;
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
public class HotelUpdateRequest {
  String name;
  String description;
  String address;
  String countryId;
  String provinceId;
  String cityId;
  String districtId;
  String wardId;
  String streetId;

  List<PhotoCreationRequest> photosToAdd;
  List<PhotoDeleteRequest> photosToDelete;

  @DecimalMin(value = ValidationPatterns.LATITUDE_MIN, message = "LATITUDE_INVALID")
  @DecimalMax(value = ValidationPatterns.LATITUDE_MAX, message = "LATITUDE_INVALID")
  Double latitude;

  @DecimalMin(value = ValidationPatterns.LONGITUDE_MIN, message = "LONGITUDE_INVALID")
  @DecimalMax(value = ValidationPatterns.LONGITUDE_MAX, message = "LONGITUDE_INVALID")
  Double longitude;

  Boolean allowsPayAtHotel;

  @Pattern(regexp = ValidationPatterns.HOTEL_STATUS, message = "HOTEL_STATUS_INVALID")
  String status;
}
