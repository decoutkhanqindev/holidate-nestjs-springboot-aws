package com.webapp.holidate.mapper.image;

import com.webapp.holidate.dto.response.image.PhotoCategoryResponse;
import com.webapp.holidate.dto.response.image.PhotoResponse;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.image.PhotoCategory;
import com.webapp.holidate.entity.image.RoomPhoto;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface PhotoCategoryMapper {
  @Named("hotelPhotosToCategories")
  default List<PhotoCategoryResponse> toPhotoCategoryResponseList(Set<HotelPhoto> hotelPhotos) {
    boolean hasPhotos = hotelPhotos != null && !hotelPhotos.isEmpty();
    if (!hasPhotos) {
      return List.of();
    }

    // group photos by category
    Map<PhotoCategory, List<HotelPhoto>> photosByCategory = hotelPhotos.stream()
      .collect(Collectors.groupingBy(hotelPhoto -> hotelPhoto.getPhoto().getCategory()));

    return photosByCategory.entrySet().stream()
      .map(entry -> {
          PhotoCategory category = entry.getKey();
          List<HotelPhoto> photosInCategory = entry.getValue();

          List<PhotoResponse> photoResponses = photosInCategory.stream()
            .map(hotelPhoto ->
              PhotoResponse.builder()
                .id(hotelPhoto.getPhoto().getId())
                .url(hotelPhoto.getPhoto().getUrl())
                .build()
            )
            .toList();

          return PhotoCategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .photos(photoResponses)
            .build();
        }
      )
      .toList();
  }

  @Named("roomPhotosToCategories")
  default List<PhotoCategoryResponse> toRoomPhotoCategoryResponseList(Set<RoomPhoto> roomPhotos) {
    boolean hasPhotos = roomPhotos != null && !roomPhotos.isEmpty();
    if (!hasPhotos) {
      return List.of();
    }

    // group photos by category
    Map<PhotoCategory, List<RoomPhoto>> photosByCategory = roomPhotos.stream()
      .collect(Collectors.groupingBy(hotelPhoto -> hotelPhoto.getPhoto().getCategory()));

    return photosByCategory.entrySet().stream()
      .map(entry -> {
          PhotoCategory category = entry.getKey();
          List<RoomPhoto> photosInCategory = entry.getValue();

          List<PhotoResponse> photoResponses = photosInCategory.stream()
            .map(hotelPhoto ->
              PhotoResponse.builder()
                .id(hotelPhoto.getPhoto().getId())
                .url(hotelPhoto.getPhoto().getUrl())
                .build()
            )
            .toList();

          return PhotoCategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .photos(photoResponses)
            .build();
        }
      )
      .toList();
  }
}
