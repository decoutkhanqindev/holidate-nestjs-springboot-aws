package com.webapp.holidate.entity.document;


import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.policy.HotelPolicy;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.HOTEL_POLICY_IDENTIFICATION_DOCUMENTS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class HotelPolicyIdentificationDocument {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.HOTEL_POLICY_ID, nullable = false)
  HotelPolicy hotelPolicy;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.IDENTIFICATION_DOCUMENT_ID, nullable = false)
  IdentificationDocument identificationDocument;
}
