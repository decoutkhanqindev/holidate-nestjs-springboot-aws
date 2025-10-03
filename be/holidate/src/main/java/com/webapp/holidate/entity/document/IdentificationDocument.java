package com.webapp.holidate.entity.document;

import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.IDENTIFICATION_DOCUMENTS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class IdentificationDocument {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  /**
   * Mã định danh duy nhất, không thay đổi (dùng cho logic).
   * Ví dụ: "NATIONAL_ID", "PASSPORT", "BIRTH_CERTIFICATE"
   */
  @Column(nullable = false, unique = true)
  String code;

  /**
   * Tên hiển thị cho người dùng.
   * Ví dụ: "Căn cước công dân / CMND", "Hộ chiếu", "Giấy khai sinh (cho trẻ em)"
   */
  @Column(nullable = false)
  String name;
}