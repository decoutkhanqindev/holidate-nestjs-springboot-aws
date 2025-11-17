package com.webapp.holidate.entity.report;

import com.webapp.holidate.constants.db.DbFieldNames;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDate;

@Embeddable
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class HotelDailyReportId implements Serializable {
  @Column(name = DbFieldNames.HOTEL_ID, nullable = false)
  String hotelId;

  @Column(nullable = false)
  LocalDate reportDate;
}

