package com.webapp.holidate.mapper.image;

import com.webapp.holidate.dto.response.image.PhotoResponse;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.image.Photo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", uses = { PhotoCategoryMapper.class })
public interface PhotoMapper {
  @Mapping(source = "photo.id", target = "id")
  @Mapping(source = "photo.url", target = "url")
  @Mapping(source = "photo.category", target = "category")
  PhotoResponse toPhotoResponse(HotelPhoto hotelPhoto);

  @Mapping(source = "category", target = "category")
  PhotoResponse toPhotoResponse(Photo photo);

  List<PhotoResponse> toPhotoResponseList(Set<HotelPhoto> hotelPhotos);

  List<PhotoResponse> toPhotoResponseListFromPhotos(List<Photo> photos);
}
