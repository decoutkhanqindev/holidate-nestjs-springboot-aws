package com.webapp.holidate.entity.user;

import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.ROLES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Role {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @Column(nullable = false, unique = true)
  String name;

  @Column(nullable = false)
  String description;
}