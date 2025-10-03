package com.webapp.holidate.entity.policy.cancelation;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.CANCELLATION_RULES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CancellationRule {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.POLICY_ID, nullable = false)
  CancellationPolicy policy;

  /**
   * Số ngày trước ngày nhận phòng mà quy tắc này bắt đầu có hiệu lực.
   * Ví dụ:
   * - 7: Áp dụng cho việc hủy từ 7 ngày trở đi trước ngày nhận phòng.
   * - 0: Áp dụng cho việc hủy trong khoảng thời gian từ ngày nhận phòng trở về trước (tùy thuộc vào quy tắc khác).
   */
  @Column(nullable = false)
  int daysBeforeCheckIn;

  /**
   * Tỷ lệ phần trăm phạt trên tổng giá trị đặt phòng.
   * Ví dụ:
   * - 0: Hủy miễn phí.
   * - 50: Phạt 50% giá trị đặt phòng.
   * - 100: Phạt 100% (không hoàn tiền).
   */
  @Column(nullable = false)
  int penaltyPercentage;
}
