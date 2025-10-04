package com.webapp.holidate.mapper.policy;

import com.webapp.holidate.dto.response.policy.HotelPolicyResponse;
import com.webapp.holidate.dto.response.policy.HotelPolicyIdentificationDocumentResponse;
import com.webapp.holidate.entity.policy.HotelPolicy;
import com.webapp.holidate.entity.document.HotelPolicyIdentificationDocument;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HotelPolicyMapper {
  HotelPolicyResponse toHotelPolicyResponse(HotelPolicy hotelPolicy);

  @Mapping(source = "identificationDocument.name", target = "name")
  HotelPolicyIdentificationDocumentResponse toHotelPolicyIdentificationDocumentResponse(HotelPolicyIdentificationDocument document);
}