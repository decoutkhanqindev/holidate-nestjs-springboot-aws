package com.webapp.holidate.entity.policy;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.CHILDREN_POLICY_RULES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ChildrenPolicyRule {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.HOTEL_POLICY_ID, nullable = false)
  HotelPolicy hotelPolicy;

  @Column(nullable = false)
  int fromAge; // Tuổi bắt đầu áp dụng, ví dụ: 0

  @Column(nullable = false)
  int toAge; // Tuổi kết thúc áp dụng, ví dụ: 5 (cho nhóm 0-5 tuổi)

  /**
   * Quy định về chỗ ở: FREE_SHARE_BED (Miễn phí ngủ chung),
   * EXTRA_FEE_REQUIRED_BED (Phụ thu giường phụ), CONSIDERED_ADULT (Tính như người lớn).
   * Sử dụng Enum sẽ tốt hơn String.
   */
  @Column(nullable = false)
  String accommodationPolicy;

  /**
   * Phí phụ thu cho chỗ ở (nếu có).
   */
  @Column
  @Builder.Default
  double accommodationFee = 0.0;

  /**
   * Một ghi chú ngắn gọn cho quy tắc này nếu cần.
   * Ví dụ: "Bắt buộc giường phụ", "Ngủ chung giường với bố mẹ"
   */
  @Column(columnDefinition = "TEXT")
  String notes;
}