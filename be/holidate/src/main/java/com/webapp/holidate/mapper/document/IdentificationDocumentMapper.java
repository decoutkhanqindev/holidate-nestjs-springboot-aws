package com.webapp.holidate.mapper.document;

import com.webapp.holidate.dto.response.document.IdentificationDocumentResponse;
import com.webapp.holidate.entity.document.IdentificationDocument;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface IdentificationDocumentMapper {
  IdentificationDocumentResponse toIdentificationDocumentResponse(IdentificationDocument identificationDocument);
}
