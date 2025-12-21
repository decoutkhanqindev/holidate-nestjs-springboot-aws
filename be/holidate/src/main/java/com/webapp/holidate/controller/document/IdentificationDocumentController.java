package com.webapp.holidate.controller.document;

import com.webapp.holidate.constants.api.endpoint.DocumentEndpoints;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.document.IdentificationDocumentResponse;
import com.webapp.holidate.service.document.IdentificationDocumentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(DocumentEndpoints.DOCUMENT + DocumentEndpoints.IDENTIFICATION_DOCUMENTS)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class IdentificationDocumentController {
  IdentificationDocumentService service;

  @GetMapping
  public ApiResponse<List<IdentificationDocumentResponse>> getAll() {
    List<IdentificationDocumentResponse> responses = service.getAll();
    return ApiResponse.<List<IdentificationDocumentResponse>>builder()
      .data(responses)
      .build();
  }
}

