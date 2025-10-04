package com.webapp.holidate.repository.document;

import com.webapp.holidate.entity.document.IdentificationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IdentificationDocumentRepository extends JpaRepository<IdentificationDocument, String> {
}