// File: com/webapp/holidate/entity/policy/PetPolicyRule.java (NEW ENTITY)
package com.webapp.holidate.entity.policy;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.PET_POLICY_RULES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PetPolicyRule {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.HOTEL_POLICY_ID, nullable = false)
  HotelPolicy hotelPolicy;

  String petType; // Ví dụ: "DOG", "CAT", "ANY"

  double maxWeightInKg; // Cân nặng tối đa

  double fee; // Phí cho mỗi đêm

  @Column(columnDefinition = "TEXT")
  String notes; // Ghi chú thêm: "Không được để lại một mình trong phòng"
}