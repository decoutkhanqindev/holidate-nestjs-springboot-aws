package com.webapp.holidate.mapper.review;

import com.webapp.holidate.dto.request.review.ReviewCreationRequest;
import com.webapp.holidate.dto.request.review.ReviewUpdateRequest;
import com.webapp.holidate.dto.response.image.PhotoResponse;
import com.webapp.holidate.dto.response.review.ReviewDetailsResponse;
import com.webapp.holidate.dto.response.review.ReviewResponse;
import com.webapp.holidate.entity.booking.Review;
import com.webapp.holidate.entity.image.ReviewPhoto;
import com.webapp.holidate.mapper.acommodation.HotelMapper;
import com.webapp.holidate.mapper.booking.BookingMapper;
import com.webapp.holidate.mapper.image.PhotoCategoryMapper;
import com.webapp.holidate.mapper.user.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", uses = {
    UserMapper.class,
    HotelMapper.class,
    BookingMapper.class,
    PhotoCategoryMapper.class
})
public interface ReviewMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "hotel", ignore = true)
  @Mapping(target = "user", ignore = true)
  @Mapping(target = "booking", ignore = true)
  @Mapping(target = "photos", ignore = true)
  @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
  @Mapping(target = "updatedAt", ignore = true)
  Review toEntity(ReviewCreationRequest request);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
  @Mapping(target = "booking", ignore = true)
  @Mapping(target = "hotel", ignore = true)
  @Mapping(target = "user", ignore = true)
  @Mapping(target = "photos", ignore = true)
  void updateEntity(ReviewUpdateRequest request, @MappingTarget Review entity);

  @Mapping(source = "photos", target = "photos", qualifiedByName = "reviewPhotosToList")
  ReviewResponse toReviewResponse(Review review);

  @Mapping(source = "photos", target = "photos", qualifiedByName = "reviewPhotosToList")
  ReviewDetailsResponse toReviewDetailsResponse(Review review);

  @Named("reviewPhotosToList")
  default List<PhotoResponse> reviewPhotosToList(Set<ReviewPhoto> reviewPhotos) {
    if (reviewPhotos == null || reviewPhotos.isEmpty()) {
      return List.of();
    }

    return reviewPhotos.stream()
        .map(reviewPhoto -> PhotoResponse.builder()
            .id(reviewPhoto.getPhoto().getId())
            .url(reviewPhoto.getPhoto().getUrl())
            .build())
        .toList();
  }
}
