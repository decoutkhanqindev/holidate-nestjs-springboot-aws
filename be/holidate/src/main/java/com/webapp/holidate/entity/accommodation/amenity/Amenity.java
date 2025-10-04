package com.webapp.holidate.entity.accommodation.amenity;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.AMENITIES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Amenity {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @Column(nullable = false, unique = true)
  String name;

  @Column(nullable = false)
  boolean free;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.AMENITY_CATEGORY_ID, nullable = false)
  @ToString.Exclude
  AmenityCategory category;
}