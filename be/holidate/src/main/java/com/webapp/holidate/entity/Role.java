package com.webapp.holidate.entity;

import com.webapp.holidate.constants.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Table(name = DbTableNames.ROLES)
@Entity
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
  String id;
  @NonNull
  String name;
  @NonNull
  String description;
}
