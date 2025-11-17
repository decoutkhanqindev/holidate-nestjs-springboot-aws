package com.webapp.holidate.entity.report;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = DbTableNames.ROOM_DAILY_PERFORMANCES, indexes = {
    @Index(name = "idx_room_daily_performance_hotel_id", columnList = DbFieldNames.HOTEL_ID)
})
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class RoomDailyPerformance {
  @EmbeddedId
  RoomDailyPerformanceId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId(DbFieldNames.ROOM_ID_CAMEL)
  @JoinColumn(name = DbFieldNames.ROOM_ID, nullable = false)
  @ToString.Exclude
  Room room;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = DbFieldNames.HOTEL_ID, nullable = false)
  @ToString.Exclude
  Hotel hotel;

  @Column(nullable = false)
  @Builder.Default
  double revenue = 0.0;

  @Column(nullable = false)
  @Builder.Default
  int bookedRoomNights = 0;

  @Column(nullable = false)
  LocalDateTime updatedAt;
}

