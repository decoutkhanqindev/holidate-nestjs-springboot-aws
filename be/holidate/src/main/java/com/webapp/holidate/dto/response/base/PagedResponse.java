package com.webapp.holidate.dto.response.base;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
  List<T> content;
  int page;
  int size;
  long totalElements;
  int totalPages;
  boolean first;
  boolean last;
  boolean hasNext;
  boolean hasPrevious;
}