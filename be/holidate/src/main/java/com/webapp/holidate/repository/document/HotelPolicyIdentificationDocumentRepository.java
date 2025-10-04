package com.webapp.holidate.repository.document;

import com.webapp.holidate.entity.document.HotelPolicyIdentificationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelPolicyIdentificationDocumentRepository extends JpaRepository<HotelPolicyIdentificationDocument, String> {
}