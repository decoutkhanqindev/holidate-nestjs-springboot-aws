package com.webapp.holidate.entity.policy.reschedule;

import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = DbTableNames.RESCHEDULE_POLICIES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ReschedulePolicy {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  @Column(nullable = false, unique = true)
  String name; // Ví dụ: "Linh hoạt 7 ngày", "Không được đổi", "Nghiêm ngặt"

  @Column(columnDefinition = "TEXT")
  String description; // Mô tả chi tiết

  // Một chính sách đổi lịch sẽ bao gồm nhiều quy tắc
  @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  @Builder.Default
  Set<RescheduleRule> rules = new HashSet<>();
}
