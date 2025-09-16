package com.webapp.holidate.entity;

import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.INVALID_TOKENS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class InvalidToken {
  @Id
  String id;
  @Column(nullable = false, columnDefinition = "TEXT")
  String token;
}
