package com.webapp.holidate.utils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public class DateTimeUtil {
  public static int millisToDays(long millis) {
    return (int) (millis / (1000 * 60 * 60 * 24));
  }

  public static LocalDateTime millisToLocalDateTime(long millis) {
    return new Date(System.currentTimeMillis() + millis)
      .toInstant()
      .atZone(ZoneId.systemDefault()).toLocalDateTime();
  }

  public static LocalDateTime dateToLocalDateTime(Date date) {
    return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
  }
}
