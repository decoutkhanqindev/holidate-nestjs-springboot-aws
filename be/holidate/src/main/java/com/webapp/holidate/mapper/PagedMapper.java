package com.webapp.holidate.mapper;

import com.webapp.holidate.dto.response.base.PagedResponse;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

@Mapper(componentModel = "spring")
public interface PagedMapper {
  default <T, R> PagedResponse<R> toPagedResponse(Page<T> page, Function<T, R> contentMapper) {
    boolean hasContent = page != null && page.hasContent();
    if (!hasContent) {
      return PagedResponse.<R>builder()
          .content(List.of())
          .page(0)
          .size(0)
          .totalItems(0)
          .totalPages(0)
          .first(true)
          .last(true)
          .hasNext(false)
          .hasPrevious(false)
          .build();
    }

    List<R> mappedContent = page.getContent()
        .stream()
        .map(contentMapper)
        .toList();

    return PagedResponse.<R>builder()
        .content(mappedContent)
        .page(page.getNumber())
        .size(page.getSize())
        .totalItems(page.getTotalElements())
        .totalPages(page.getTotalPages())
        .first(page.isFirst())
        .last(page.isLast())
        .hasNext(page.hasNext())
        .hasPrevious(page.hasPrevious())
        .build();
  }

  default <T> PagedResponse<T> toPagedResponse(Page<T> page) {
    return toPagedResponse(page, Function.identity());
  }

  default <T> PagedResponse<T> createEmptyPagedResponse(int page, int size) {
    return PagedResponse.<T>builder()
        .content(List.of())
        .page(page)
        .size(size)
        .totalItems(0)
        .totalPages(0)
        .first(page == 0)
        .last(true)
        .hasNext(false)
        .hasPrevious(page > 0)
        .build();
  }

  default <T> PagedResponse<T> createPagedResponse(
      List<T> content, int page, int size,
      long totalElements, int totalPages) {
    return PagedResponse.<T>builder()
        .content(content != null ? content : List.of())
        .page(page)
        .size(size)
        .totalItems(totalElements)
        .totalPages(totalPages)
        .first(page == 0)
        .last(page >= totalPages - 1)
        .hasNext(page < totalPages - 1)
        .hasPrevious(page > 0)
        .build();
  }
}
