package com.webapp.holidate.service.document;

import com.webapp.holidate.dto.response.document.IdentificationDocumentResponse;
import com.webapp.holidate.mapper.document.IdentificationDocumentMapper;
import com.webapp.holidate.repository.document.IdentificationDocumentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class IdentificationDocumentService {
  IdentificationDocumentRepository repository;
  IdentificationDocumentMapper mapper;

  @Transactional(readOnly = true)
  public List<IdentificationDocumentResponse> getAll() {
    return repository.findAll()
        .stream()
        .map(mapper::toIdentificationDocumentResponse)
        .toList();
  }
}
