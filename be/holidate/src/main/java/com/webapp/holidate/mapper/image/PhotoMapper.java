package com.webapp.holidate.mapper.image;

import com.webapp.holidate.dto.response.image.PhotoResponse;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.image.Photo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { PhotoCategoryMapper.class })
public interface PhotoMapper {
  @Mapping(source = "photo.id", target = "id")
  @Mapping(source = "photo.url", target = "url")
  PhotoResponse toPhotoResponse(HotelPhoto hotelPhoto);

  PhotoResponse toPhotoResponse(Photo photo);
}
