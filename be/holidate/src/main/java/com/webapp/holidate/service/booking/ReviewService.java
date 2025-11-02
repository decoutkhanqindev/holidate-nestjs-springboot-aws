package com.webapp.holidate.service.booking;

import com.webapp.holidate.constants.api.param.CommonParams;
import com.webapp.holidate.constants.api.param.ReviewParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import com.webapp.holidate.dto.request.review.ReviewCreationRequest;
import com.webapp.holidate.dto.request.review.ReviewUpdateRequest;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.dto.response.review.ReviewDetailsResponse;
import com.webapp.holidate.dto.response.review.ReviewResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.booking.Booking;
import com.webapp.holidate.entity.booking.Review;
import com.webapp.holidate.entity.image.Photo;
import com.webapp.holidate.entity.image.PhotoCategory;
import com.webapp.holidate.entity.image.ReviewPhoto;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.PagedMapper;
import com.webapp.holidate.mapper.review.ReviewMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.booking.BookingRepository;
import com.webapp.holidate.repository.booking.ReviewRepository;
import com.webapp.holidate.repository.image.PhotoCategoryRepository;
import com.webapp.holidate.repository.image.PhotoRepository;
import com.webapp.holidate.repository.image.ReviewPhotoRepository;
import com.webapp.holidate.service.storage.FileService;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ReviewService {
  ReviewRepository reviewRepository;
  BookingRepository bookingRepository;
  PhotoCategoryRepository photoCategoryRepository;
  PhotoRepository photoRepository;
  ReviewPhotoRepository reviewPhotoRepository;
  HotelRepository hotelRepository;

  FileService fileService;

  ReviewMapper reviewMapper;
  PagedMapper pagedMapper;

  @Transactional
  public ReviewDetailsResponse create(ReviewCreationRequest request) throws IOException {
    String bookingId = request.getBookingId();
    Booking booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new AppException(ErrorType.BOOKING_NOT_FOUND));

    // Check if review already exists for this booking
    if (booking.getReview() != null) {
      throw new AppException(ErrorType.BOOKING_ALREADY_COMPLETED);
    }

    Review review = reviewMapper.toEntity(request);
    review.setBooking(booking);
    review.setUser(booking.getUser());
    review.setHotel(booking.getHotel());

    // Save review first to make it managed and get ID
    reviewRepository.save(review);

    // Link review to booking
    booking.setReview(review);

    // Handle photos after review is saved
    List<PhotoCreationRequest> photos = request.getPhotos();
    boolean hasPhotosToAdd = photos != null && !photos.isEmpty();
    if (hasPhotosToAdd) {
      Set<ReviewPhoto> reviewPhotos = new HashSet<>();

      for (PhotoCreationRequest photoRequest : photos) {
        String categoryId = photoRequest.getCategoryId();
        PhotoCategory category = photoCategoryRepository.findById(categoryId)
            .orElseThrow(() -> new AppException(ErrorType.PHOTO_CATEGORY_NOT_FOUND));

        List<MultipartFile> files = photoRequest.getFiles();
        boolean hasFiles = files != null && !files.isEmpty();
        if (hasFiles) {
          for (MultipartFile file : files) {
            boolean hasFile = file != null && !file.isEmpty();
            if (hasFile) {
              fileService.upload(file);

              String fileName = file.getOriginalFilename();
              String url = fileService.createFileUrl(fileName);
              Photo photo = Photo.builder()
                  .url(url)
                  .category(category)
                  .build();
              photoRepository.save(photo);

              ReviewPhoto reviewPhoto = ReviewPhoto.builder()
                  .review(review)
                  .photo(photo)
                  .build();
              reviewPhotoRepository.save(reviewPhoto);
              reviewPhotos.add(reviewPhoto);
            }
          }
        }
      }

      review.setPhotos(reviewPhotos);
    }

    reviewRepository.save(review);

    // Update hotel star rating
    updateHotelStarRating(review.getHotel());

    // Reload with all relationships for response
    Review finalReview = reviewRepository.findByIdWithDetails(review.getId())
        .orElseThrow(() -> new AppException(ErrorType.REVIEW_NOT_FOUND));
    return reviewMapper.toReviewDetailsResponse(finalReview);
  }

  public PagedResponse<ReviewResponse> getAll(
      String hotelId, String userId, String bookingId,
      Integer minScore, Integer maxScore,
      int page, int size, String sortBy, String sortDir) {
    // Clean up page and size values
    page = Math.max(0, page);
    size = Math.min(Math.max(1, size), 100);

    // Check if sort direction is valid
    boolean hasSortDir = sortDir != null && !sortDir.isEmpty()
        && (SortingParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir) ||
            SortingParams.SORT_DIR_DESC.equalsIgnoreCase(sortDir));
    if (!hasSortDir) {
      sortDir = SortingParams.SORT_DIR_DESC;
    }

    // Check if sort field is valid
    boolean hasSortBy = sortBy != null && !sortBy.isEmpty()
        && (ReviewParams.SCORE.equals(sortBy) ||
            CommonParams.CREATED_AT.equals(sortBy));
    if (!hasSortBy) {
      sortBy = null;
    }

    // Create Pageable with sorting
    Pageable pageable = createPageable(page, size, sortBy, sortDir);

    // Get reviews from database with pagination
    Page<Review> reviewPage = reviewRepository.findAllWithFiltersPaged(
        hotelId, userId, bookingId, minScore, maxScore, pageable);

    // Check if we have any reviews
    if (reviewPage.isEmpty()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Convert entities to response DTOs
    List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
        .map(reviewMapper::toReviewResponse)
        .toList();

    // Create and return paged response with database pagination metadata
    return pagedMapper.createPagedResponse(
        reviewResponses,
        page,
        size,
        reviewPage.getTotalElements(),
        reviewPage.getTotalPages());
  }

  // Create Pageable object with sorting
  private Pageable createPageable(int page, int size, String sortBy, String sortDir) {
    if (sortBy == null) {
      return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // Map sort field to entity field
    String entitySortField = mapSortFieldToEntity(sortBy);
    Sort.Direction direction = SortingParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir)
        ? Sort.Direction.ASC
        : Sort.Direction.DESC;

    Sort sort = Sort.by(direction, entitySortField);
    return PageRequest.of(page, size, sort);
  }

  // Map API sort field to entity field name
  private String mapSortFieldToEntity(String sortBy) {
    return switch (sortBy) {
      case ReviewParams.SCORE -> "score";
      case CommonParams.CREATED_AT -> "createdAt";
      default -> "createdAt"; // Default sorting
    };
  }

  public ReviewDetailsResponse getById(String id) {
    Review review = reviewRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new AppException(ErrorType.REVIEW_NOT_FOUND));
    return reviewMapper.toReviewDetailsResponse(review);
  }

  @Transactional
  public ReviewDetailsResponse update(String id, ReviewUpdateRequest request) throws IOException {
    Review review = reviewRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new AppException(ErrorType.REVIEW_NOT_FOUND));

    // Update basic fields using mapper
    reviewMapper.updateEntity(request, review);

    // Update photos
    updatePhotos(review, request);

    reviewRepository.save(review);

    // Update hotel star rating
    updateHotelStarRating(review.getHotel());

    // Reload with all relationships for response
    Review updatedReview = reviewRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new AppException(ErrorType.REVIEW_NOT_FOUND));
    return reviewMapper.toReviewDetailsResponse(updatedReview);
  }

  private void updatePhotos(Review review, ReviewUpdateRequest request) throws IOException {
    Set<ReviewPhoto> currentPhotos = review.getPhotos();

    // Delete photos
    List<String> photoIdsToDelete = request.getPhotoIdsToDelete();
    boolean hasPhotosToDelete = photoIdsToDelete != null && !photoIdsToDelete.isEmpty();
    if (hasPhotosToDelete) {
      List<ReviewPhoto> photosToRemove = currentPhotos.stream()
          .filter(reviewPhoto -> photoIdsToDelete.contains(reviewPhoto.getPhoto().getId()))
          .toList();

      for (ReviewPhoto photoToRemove : photosToRemove) {
        currentPhotos.remove(photoToRemove);
        reviewPhotoRepository.delete(photoToRemove);
      }

      for (String photoId : photoIdsToDelete) {
        Photo photo = photoRepository.findById(photoId)
            .orElseThrow(() -> new AppException(ErrorType.PHOTO_NOT_FOUND));
        String fileUrl = photo.getUrl();
        fileService.delete(fileUrl);
        photoRepository.delete(photo);
      }
    }

    // Add new photos
    List<PhotoCreationRequest> photosToAdd = request.getPhotosToAdd();
    boolean hasPhotosToAdd = photosToAdd != null && !photosToAdd.isEmpty();
    if (hasPhotosToAdd) {
      for (PhotoCreationRequest photoToAdd : photosToAdd) {
        String categoryId = photoToAdd.getCategoryId();
        PhotoCategory category = photoCategoryRepository.findById(categoryId)
            .orElseThrow(() -> new AppException(ErrorType.PHOTO_CATEGORY_NOT_FOUND));

        List<MultipartFile> files = photoToAdd.getFiles();
        boolean hasFiles = files != null && !files.isEmpty();
        if (hasFiles) {
          for (MultipartFile file : files) {
            boolean hasFile = file != null && !file.isEmpty();
            if (hasFile) {
              fileService.upload(file);

              String fileName = file.getOriginalFilename();
              String url = fileService.createFileUrl(fileName);
              Photo photo = Photo.builder()
                  .url(url)
                  .category(category)
                  .build();
              photoRepository.save(photo);

              ReviewPhoto reviewPhoto = ReviewPhoto.builder()
                  .review(review)
                  .photo(photo)
                  .build();
              reviewPhotoRepository.save(reviewPhoto);
              currentPhotos.add(reviewPhoto);
            }
          }
        }
      }
    }

    review.setPhotos(currentPhotos);
  }

  @Transactional
  public ReviewDetailsResponse delete(String id) {
    Review review = reviewRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new AppException(ErrorType.REVIEW_NOT_FOUND));

    Hotel hotel = review.getHotel();

    reviewRepository.delete(review);

    // Update hotel star rating after deletion
    updateHotelStarRating(hotel);

    return reviewMapper.toReviewDetailsResponse(review);
  }

  private void updateHotelStarRating(Hotel hotel) {
    // Fetch all reviews for this hotel using the query with FETCH to avoid N+1
    Hotel hotelWithReviews = hotelRepository.findByIdWithDetails(hotel.getId())
        .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));

    Set<Review> reviews = hotelWithReviews.getReviews();
    if (reviews == null || reviews.isEmpty()) {
      hotel.setStarRating(0);
      hotelRepository.save(hotel);
      return;
    }

    // Calculate average score (review scores are 1-10)
    double averageScore = reviews.stream()
        .mapToInt(Review::getScore)
        .average()
        .orElse(0.0);

    // Convert review score (1-10) to star rating (1-5)
    // Formula: (averageScore / 10) * 5, rounded
    int newStarRating = (int) Math.round((averageScore / 10.0) * 5);

    // Ensure star rating is between 1-5
    newStarRating = Math.max(1, Math.min(5, newStarRating));

    hotel.setStarRating(newStarRating);
    hotelRepository.save(hotel);
  }
}
