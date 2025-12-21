package com.webapp.holidate.entity.policy.reschedule;

import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.RESCHEDULE_RULES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class RescheduleRule {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  // Quy tắc liên kết với policy
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "policy_id", nullable = false)
  @ToString.Exclude
  ReschedulePolicy policy;

  // Số ngày trước ngày check-in để đổi lịch
  @Column(nullable = true)
  int daysBeforeCheckin;

  // Phí đổi lịch theo phần trăm
  @Column(nullable = false)
  int feePercentage;
}
