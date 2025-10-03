package com.webapp.holidate.entity.policy.cancelation;

import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = DbTableNames.CANCELLATION_POLICIES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CancellationPolicy {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  @Column(nullable = false, unique = true)
  String name; // Ví dụ: "Linh hoạt 7 ngày", "Không hoàn hủy", "Nghiêm ngặt"

  @Column(columnDefinition = "TEXT")
  String description; // Mô tả chi tiết để hiển thị cho người dùng

  // Một chính sách sẽ bao gồm nhiều quy tắc hủy
  @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  @Builder.Default
  Set<CancellationRule> rules = new HashSet<>();
}
