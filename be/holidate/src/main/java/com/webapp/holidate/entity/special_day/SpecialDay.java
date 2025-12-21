package com.webapp.holidate.entity.special_day;

import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.discount.SpecialDayDiscount;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = DbTableNames.SPECIAL_DAYS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class SpecialDay {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @Column(nullable = false, unique = true)
  LocalDate date;

  @Column(nullable = false)
  String name;

  @OneToMany(mappedBy = "specialDay", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @ToString.Exclude
  @Builder.Default
  Set<SpecialDayDiscount> discounts = new HashSet<>();
}
