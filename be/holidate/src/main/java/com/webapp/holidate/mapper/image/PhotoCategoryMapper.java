package com.webapp.holidate.mapper.image;

import com.webapp.holidate.dto.response.image.PhotoCategoryResponse;
import com.webapp.holidate.dto.response.image.PhotoResponse;
import com.webapp.holidate.entity.image.Photo;
import com.webapp.holidate.entity.image.PhotoCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PhotoCategoryMapper {
  PhotoCategoryResponse toResponse(PhotoCategory photoCategory);
}
