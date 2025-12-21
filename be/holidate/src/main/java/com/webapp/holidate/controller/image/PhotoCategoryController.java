package com.webapp.holidate.controller.image;

import com.webapp.holidate.constants.api.endpoint.ImageEndpoints;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.image.PhotoCategorySimpleResponse;
import com.webapp.holidate.service.image.PhotoCategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ImageEndpoints.IMAGE + ImageEndpoints.PHOTO_CATEGORIES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PhotoCategoryController {
  PhotoCategoryService service;

  @GetMapping
  public ApiResponse<List<PhotoCategorySimpleResponse>> getAll() {
    List<PhotoCategorySimpleResponse> responses = service.getAll();
    return ApiResponse.<List<PhotoCategorySimpleResponse>>builder()
      .data(responses)
      .build();
  }
}

