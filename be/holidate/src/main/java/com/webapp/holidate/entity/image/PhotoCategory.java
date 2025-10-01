package com.webapp.holidate.entity.image;

import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = DbTableNames.PHOTO_CATEGORIES)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class PhotoCategory {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  String id;

  @Column(nullable = false, unique = true)
  String name;

  @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  @ToString.Exclude
  @Builder.Default
  List<Photo> photos = new ArrayList<>();
}
