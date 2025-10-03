// File: com/webapp/holidate/entity/policy/HotelPolicy.java (FINAL VERSION)
package com.webapp.holidate.entity.policy;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.document.HotelPolicyIdentificationDocument;
import com.webapp.holidate.entity.policy.cancelation.CancellationPolicy;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = DbTableNames.HOTEL_POLICIES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class HotelPolicy {
  @Id
  @Column(name = DbFieldNames.HOTEL_ID)
  String id;

  @OneToOne(fetch = FetchType.LAZY)
  @MapsId
  @JoinColumn(name = DbFieldNames.HOTEL_ID)
  Hotel hotel;

  @Column(nullable = false)
  LocalTime checkInTime;

  @Column(nullable = false)
  LocalTime checkOutTime;

  @Column(nullable = false)
  @Builder.Default
  boolean allowsPayAtHotel = false;

  @OneToMany(mappedBy = "hotelPolicy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @Builder.Default
  Set<PetPolicyRule> petPolicyRules = new HashSet<>();

  @OneToMany(mappedBy = "hotelPolicy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @Builder.Default
  Set<ChildrenPolicyRule> childrenPolicyRules = new HashSet<>();

  @OneToMany(mappedBy = "hotelPolicy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @Builder.Default
  Set<HotelPolicyIdentificationDocument> requiredIdentificationDocuments = new HashSet<>();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.CANCELLATION_POLICY_ID)
  CancellationPolicy cancellationPolicy;
}