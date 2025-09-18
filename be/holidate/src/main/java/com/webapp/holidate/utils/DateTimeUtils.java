package com.webapp.holidate.utils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public class DateTimeUtils {
  public static LocalDateTime millisToLocalDateTime(long millis) {
    return new Date(System.currentTimeMillis() + millis)
      .toInstant()
      .atZone(ZoneId.systemDefault()).toLocalDateTime();
  }

  public static LocalDateTime dateToLocalDateTime(Date date) {
    return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
  }
}
