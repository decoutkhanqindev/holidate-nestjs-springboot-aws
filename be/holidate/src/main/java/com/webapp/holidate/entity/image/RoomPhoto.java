package com.webapp.holidate.entity.image;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = DbTableNames.ROOM_PHOTOS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class RoomPhoto {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = DbFieldNames.ROOM_ID)
  @ToString.Exclude
  private Room room;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = DbFieldNames.PHOTO_ID)
  @ToString.Exclude
  private Photo photo;
}
