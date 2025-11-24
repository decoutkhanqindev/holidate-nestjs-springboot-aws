package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LocationHierarchyDto {
    String country;
    String countryCode;
    String province;
    String provinceName;
    String city;
    String cityName;
    String citySlug;
    String district;
    String districtName;
    String districtSlug;
    String ward;
    String wardName;
    String street;
    String streetName;
    String address;
    Double latitude;
    Double longitude;
}

