package com.webapp.holidate.service.image;

import com.webapp.holidate.dto.response.image.PhotoCategorySimpleResponse;
import com.webapp.holidate.mapper.image.PhotoCategoryMapper;
import com.webapp.holidate.repository.image.PhotoCategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PhotoCategoryService {
  PhotoCategoryRepository repository;
  PhotoCategoryMapper mapper;

  public List<PhotoCategorySimpleResponse> getAll() {
    return repository.findAll()
        .stream()
        .map(mapper::toPhotoCategorySimpleResponse)
        .toList();
  }
}
