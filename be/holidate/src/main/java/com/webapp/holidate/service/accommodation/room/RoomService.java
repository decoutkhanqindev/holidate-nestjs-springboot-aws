package com.webapp.holidate.service.accommodation.room;

import com.webapp.holidate.constants.api.param.CommonParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.dto.request.acommodation.room.RoomCreationRequest;
import com.webapp.holidate.dto.request.acommodation.room.RoomUpdateRequest;
import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import com.webapp.holidate.dto.response.acommodation.room.RoomDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.BedType;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.amenity.Amenity;
import com.webapp.holidate.entity.amenity.RoomAmenity;
import com.webapp.holidate.entity.image.Photo;
import com.webapp.holidate.entity.image.PhotoCategory;
import com.webapp.holidate.entity.image.RoomPhoto;
import com.webapp.holidate.entity.policy.cancelation.CancellationPolicy;
import com.webapp.holidate.entity.policy.reschedule.ReschedulePolicy;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.PagedMapper;
import com.webapp.holidate.mapper.acommodation.room.RoomMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.accommodation.room.BedTypeRepository;
import com.webapp.holidate.repository.accommodation.room.RoomRepository;
import com.webapp.holidate.repository.amenity.AmenityRepository;
import com.webapp.holidate.repository.amenity.RoomAmenityRepository;
import com.webapp.holidate.repository.booking.BookingRepository;
import com.webapp.holidate.repository.image.PhotoCategoryRepository;
import com.webapp.holidate.repository.image.PhotoRepository;
import com.webapp.holidate.repository.image.RoomPhotoRepository;
import com.webapp.holidate.repository.policy.cancellation.CancellationPolicyRepository;
import com.webapp.holidate.repository.policy.resechedule.ReschedulePolicyRepository;
import com.webapp.holidate.service.storage.FileService;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;
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
import java.util.stream.Collectors;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoomService {
  HotelRepository hotelRepository;
  RoomRepository roomRepository;
  BookingRepository bookingRepository;
  BedTypeRepository bedTypeRepository;
  CancellationPolicyRepository cancellationPolicyRepository;
  ReschedulePolicyRepository reschedulePolicyRepository;
  AmenityRepository amenityRepository;
  RoomAmenityRepository roomAmenityRepository;
  PhotoCategoryRepository photoCategoryRepository;
  PhotoRepository photoRepository;
  RoomPhotoRepository roomPhotoRepository;

  FileService fileService;

  RoomMapper roomMapper;
  PagedMapper pagedMapper;

  @Transactional
  public RoomDetailsResponse create(RoomCreationRequest request) throws IOException {
    String hotelId = request.getHotelId().trim();
    Hotel hotel = hotelRepository.findById(hotelId)
      .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));

    String name = request.getName().trim();
    boolean roomExists = roomRepository.existsByNameAndHotelId(name, hotelId);
    if (roomExists) {
      throw new AppException(ErrorType.ROOM_EXISTS);
    }

    String bedTypeId = request.getBedTypeId();
    BedType bedType = bedTypeRepository.findById(bedTypeId)
      .orElseThrow(() -> new AppException(ErrorType.BED_TYPE_NOT_FOUND));

    Room room = roomMapper.toEntity(request);
    room.setHotel(hotel);
    room.setBedType(bedType);
    room.setStatus(AccommodationStatusType.INACTIVE.getValue());

    roomRepository.save(room);

    List<PhotoCreationRequest> photos = request.getPhotos();
    boolean hasPhotosToAdd = photos != null && !photos.isEmpty();
    if (hasPhotosToAdd) {
      Set<RoomPhoto> roomPhotos = new HashSet<>();

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

              RoomPhoto roomPhoto = RoomPhoto.builder()
                .room(room)
                .photo(photo)
                .build();
              roomPhotoRepository.save(roomPhoto);
              roomPhotos.add(roomPhoto);
            }
          }
        }
      }

      room.setPhotos(roomPhotos);
    }

    List<String> amenityIds = request.getAmenityIds();
    boolean hasAmenities = amenityIds != null && !amenityIds.isEmpty();
    if (hasAmenities) {
      Set<RoomAmenity> roomAmenities = new HashSet<>();

      for (String amenityId : amenityIds) {
        Amenity amenity = amenityRepository.findById(amenityId)
          .orElseThrow(() -> new AppException(ErrorType.AMENITY_NOT_FOUND));

        RoomAmenity roomAmenity = RoomAmenity.builder()
          .room(room)
          .amenity(amenity)
          .build();
        roomAmenityRepository.save(roomAmenity);
        roomAmenities.add(roomAmenity);
      }

      room.setAmenities(roomAmenities);
    }

    roomRepository.save(room);
    return roomMapper.toRoomDetailsResponse(room);
  }

  @Transactional(readOnly = true)
  public PagedResponse<RoomResponse> getAllByHotelId(
    String hotelId, String status, int page, int size, String sortBy, String sortDir) {
    // Clean up and validate pagination parameters
    page = Math.max(0, page);
    size = Math.min(Math.max(1, size), 100);

    // Check if sort direction is valid
    boolean hasSortDir = sortDir != null && !sortDir.isEmpty()
      && (SortingParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir)
      || SortingParams.SORT_DIR_DESC.equalsIgnoreCase(sortDir));
    if (!hasSortDir) {
      sortDir = SortingParams.SORT_DIR_ASC;
    }

    // Check if sort field is valid (only price sorting allowed)
    boolean hasSortBy = sortBy != null && !sortBy.isEmpty()
      && CommonParams.PRICE.equals(sortBy);
    if (!hasSortBy) {
      sortBy = null;
    }

    // Check what filters are provided
    boolean hasStatusFilter = status != null && !status.isEmpty();

    // Use database-level pagination
    return getRoomsWithPagination(hotelId, status, hasStatusFilter, page, size, sortBy, sortDir);
  }

  // Get rooms with database-level pagination
  private PagedResponse<RoomResponse> getRoomsWithPagination(
    String hotelId, String status, boolean hasStatusFilter,
    int page, int size, String sortBy, String sortDir) {
    // Create Pageable with sorting
    Pageable pageable = createPageable(page, size, sortBy, sortDir);

    // Get data from database with pagination
    Page<Room> roomPage;
    if (hasStatusFilter) {
      roomPage = roomRepository.findAllByHotelIdWithFiltersPaged(hotelId, status, pageable);
    } else {
      roomPage = roomRepository.findAllByHotelIdWithDetailsPaged(hotelId, pageable);
    }

    // Check if we have any rooms
    if (roomPage.isEmpty()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Fetch photos, amenities, and inventories separately to avoid collection fetch warning with pagination
    // OPTIMIZED: Split photos and amenities queries to avoid cartesian product
    List<String> roomIds = roomPage.getContent().stream().map(Room::getId).toList();
    List<Room> roomsWithPhotos = roomRepository.findAllByIdsWithPhotos(roomIds);
    List<Room> roomsWithAmenities = roomRepository.findAllByIdsWithAmenities(roomIds);
    List<Room> roomsWithInventories = roomRepository.findAllByIdsWithInventories(roomIds);

    // Merge photos, amenities, and inventories data
    mergePhotosData(roomPage.getContent(), roomsWithPhotos);
    mergeAmenitiesData(roomPage.getContent(), roomsWithAmenities);
    mergeInventoriesData(roomPage.getContent(), roomsWithInventories);

    // Convert entities to response DTOs
    List<RoomResponse> roomResponses = roomPage.getContent().stream()
      .map(roomMapper::toRoomResponse)
      .toList();

    // Create and return paged response with database pagination metadata
    return pagedMapper.createPagedResponse(
      roomResponses,
      page,
      size,
      roomPage.getTotalElements(),
      roomPage.getTotalPages());
  }

  // Create Pageable object with sorting for rooms
  private Pageable createPageable(int page, int size, String sortBy, String sortDir) {
    if (sortBy == null) {
      return PageRequest.of(page, size);
    }

    // Map sort field to entity field (only price sorting supported for rooms)
    String entitySortField = mapRoomSortFieldToEntity(sortBy);

    // Determine sort direction - fixed logic to match RoomInventoryService
    Sort.Direction direction = SortingParams.SORT_DIR_DESC.equalsIgnoreCase(sortDir)
      ? Sort.Direction.DESC
      : Sort.Direction.ASC;

    Sort sort = Sort.by(direction, entitySortField);
    return PageRequest.of(page, size, sort);
  }

  // Map API sort field to entity field name for rooms
  private String mapRoomSortFieldToEntity(String sortBy) {
    return switch (sortBy) {
      case CommonParams.PRICE -> "basePricePerNight";
      default -> "createdAt"; // Default sorting by creation date
    };
  }

  @Transactional(readOnly = true)
  public RoomDetailsResponse getById(String id) {
    // Step 1: Fetch room with basic relationships (hotel with location, bedType, policies)
    // This avoids cartesian product from joining multiple collections
    Room room = roomRepository.findByIdWithBasicDetails(id)
      .orElseThrow(() -> new AppException(ErrorType.ROOM_NOT_FOUND));

    // Step 2: Fetch collections separately to avoid cartesian product
    // OPTIMIZED: Split photos and amenities into separate queries
    List<Room> roomsWithPhotos = roomRepository.findAllByIdsWithPhotos(List.of(id));
    if (!roomsWithPhotos.isEmpty()) {
      room.setPhotos(roomsWithPhotos.get(0).getPhotos());
    }

    List<Room> roomsWithAmenities = roomRepository.findAllByIdsWithAmenities(List.of(id));
    if (!roomsWithAmenities.isEmpty()) {
      room.setAmenities(roomsWithAmenities.get(0).getAmenities());
    }

    // Step 3: Fetch inventories separately (needed for price and availability calculation)
    Room roomWithInventories = roomRepository.findByIdWithInventories(id).orElse(null);
    if (roomWithInventories != null) {
      room.setInventories(roomWithInventories.getInventories());
    }

    return roomMapper.toRoomDetailsResponse(room);
  }

  // OPTIMIZED: Separate merge methods for photos and amenities to avoid cartesian product
  private void mergePhotosData(List<Room> rooms, List<Room> roomsWithPhotos) {
    rooms.forEach(room -> {
      roomsWithPhotos.stream()
        .filter(r -> r.getId().equals(room.getId()))
        .findFirst()
        .ifPresent(r -> room.setPhotos(r.getPhotos()));
    });
  }

  private void mergeAmenitiesData(List<Room> rooms, List<Room> roomsWithAmenities) {
    rooms.forEach(room -> {
      roomsWithAmenities.stream()
        .filter(r -> r.getId().equals(room.getId()))
        .findFirst()
        .ifPresent(r -> room.setAmenities(r.getAmenities()));
    });
  }

  // Combine inventories data from separate query into main room list
  private void mergeInventoriesData(List<Room> rooms, List<Room> roomsWithInventories) {
    rooms.forEach(room -> {
      roomsWithInventories.stream()
        .filter(r -> r.getId().equals(room.getId()))
        .findFirst()
        .ifPresent(r -> room.setInventories(r.getInventories()));
    });
  }

  @Transactional
  public RoomDetailsResponse update(String id, RoomUpdateRequest request) throws IOException {
    Room room = roomRepository.findByIdWithDetails(id)
      .orElseThrow(() -> new AppException(ErrorType.ROOM_NOT_FOUND));

    updateInfo(room, request);
    updatePhotos(room, request);
    updateAmenities(room, request);
    updatePolicies(room, request);

    roomRepository.save(room);
    return roomMapper.toRoomDetailsResponse(room);
  }

  private void updateInfo(Room room, RoomUpdateRequest request) {
    String newName = request.getName();
    boolean nameChanged = newName != null && !newName.equals(room.getName());
    if (nameChanged) {
      String hotelId = room.getHotel().getId();
      boolean roomExists = roomRepository.existsByNameAndHotelId(newName, hotelId);
      if (roomExists) {
        throw new AppException(ErrorType.ROOM_EXISTS);
      }
      room.setName(newName);
    }

    String newView = request.getView();
    boolean viewChanged = newView != null && !newView.equals(room.getView());
    if (viewChanged) {
      room.setView(newView);
    }

    Double newArea = request.getArea();
    boolean areaChanged = newArea != null && !newArea.equals(room.getArea());
    if (areaChanged) {
      room.setArea(newArea);
    }

    Integer newMaxAdults = request.getMaxAdults();
    boolean maxAdultsChanged = newMaxAdults != null && !newMaxAdults.equals(room.getMaxAdults());
    if (maxAdultsChanged) {
      room.setMaxAdults(newMaxAdults);
    }

    Integer newMaxChildren = request.getMaxChildren();
    boolean maxChildrenChanged = newMaxChildren != null && !newMaxChildren.equals(room.getMaxChildren());
    if (maxChildrenChanged) {
      room.setMaxChildren(newMaxChildren);
    }

    Double newBasePricePerNight = request.getBasePricePerNight();
    boolean basePriceChanged = newBasePricePerNight != null
      && !newBasePricePerNight.equals(room.getBasePricePerNight());
    if (basePriceChanged) {
      room.setBasePricePerNight(newBasePricePerNight);
    }

    String newBedTypeId = request.getBedTypeId();
    boolean bedTypeChanged = newBedTypeId != null && !newBedTypeId.equals(room.getBedType().getId());
    if (bedTypeChanged) {
      BedType bedType = bedTypeRepository.findById(newBedTypeId)
        .orElseThrow(() -> new AppException(ErrorType.BED_TYPE_NOT_FOUND));
      room.setBedType(bedType);
    }

    Boolean newSmokingAllowed = request.getSmokingAllowed();
    boolean smokingAllowedChanged = newSmokingAllowed != null && !newSmokingAllowed.equals(room.isSmokingAllowed());
    if (smokingAllowedChanged) {
      room.setSmokingAllowed(newSmokingAllowed);
    }

    Boolean newWifiAvailable = request.getWifiAvailable();
    boolean wifiAvailableChanged = newWifiAvailable != null && !newWifiAvailable.equals(room.isWifiAvailable());
    if (wifiAvailableChanged) {
      room.setWifiAvailable(newWifiAvailable);
    }

    Boolean newBreakfastIncluded = request.getBreakfastIncluded();
    boolean breakfastIncludedChanged = newBreakfastIncluded != null
      && !newBreakfastIncluded.equals(room.isBreakfastIncluded());
    if (breakfastIncludedChanged) {
      room.setBreakfastIncluded(newBreakfastIncluded);
    }

    Integer newQuantity = request.getQuantity();
    boolean quantityChanged = newQuantity != null && !newQuantity.equals(room.getQuantity());
    if (quantityChanged) {
      room.setQuantity(newQuantity);
    }

    String newStatus = request.getStatus();
    boolean statusChanged = newStatus != null && !newStatus.equals(room.getStatus());
    if (statusChanged) {
      room.setStatus(newStatus);
    }
  }

  private void updatePhotos(Room room, RoomUpdateRequest request) throws IOException {
    Set<RoomPhoto> currentPhotos = room.getPhotos();

    // Delete photos
    List<String> photoIdsToDelete = request.getPhotoIdsToDelete();
    boolean hasPhotosToDelete = photoIdsToDelete != null && !photoIdsToDelete.isEmpty();
    if (hasPhotosToDelete) {
      List<RoomPhoto> photosToRemove = currentPhotos.stream()
        .filter(roomPhoto -> photoIdsToDelete.contains(roomPhoto.getPhoto().getId()))
        .toList();

      for (RoomPhoto photoToRemove : photosToRemove) {
        currentPhotos.remove(photoToRemove);
        roomPhotoRepository.delete(photoToRemove);
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

              RoomPhoto roomPhoto = RoomPhoto.builder()
                .room(room)
                .photo(photo)
                .build();
              roomPhotoRepository.save(roomPhoto);
              currentPhotos.add(roomPhoto);
            }
          }
        }
      }
    }

    room.setPhotos(currentPhotos);
  }

  private void updateAmenities(Room room, RoomUpdateRequest request) {
    Set<RoomAmenity> currentAmenities = room.getAmenities();

    List<String> amenityIdsToRemove = request.getAmenityIdsToRemove();
    boolean hasAmenitiesToRemove = amenityIdsToRemove != null && !amenityIdsToRemove.isEmpty();
    if (hasAmenitiesToRemove) {
      currentAmenities.removeIf(roomAmenity -> amenityIdsToRemove.contains(roomAmenity.getAmenity().getId()));
    }

    List<String> amenityIdsToAdd = request.getAmenityIdsToAdd();
    boolean hasAmenitiesToAdd = amenityIdsToAdd != null && !amenityIdsToAdd.isEmpty();
    if (hasAmenitiesToAdd) {
      Set<String> existingAmenityIds = currentAmenities.stream()
        .map(roomAmenity -> roomAmenity.getAmenity().getId())
        .collect(Collectors.toSet());

      for (String amenityId : amenityIdsToAdd) {
        boolean alreadyExists = existingAmenityIds.contains(amenityId);
        if (!alreadyExists) {
          Amenity amenity = amenityRepository.findById(amenityId)
            .orElseThrow(() -> new AppException(ErrorType.AMENITY_NOT_FOUND));

          RoomAmenity roomAmenity = RoomAmenity.builder()
            .room(room)
            .amenity(amenity)
            .build();
          roomAmenityRepository.save(roomAmenity);
          currentAmenities.add(roomAmenity);
        }
      }
    }

    room.setAmenities(currentAmenities);
  }

  private void updatePolicies(Room room, RoomUpdateRequest request) {
    String newCancellationPolicyId = request.getCancellationPolicyId();
    boolean hasCancellationPolicyUpdate = newCancellationPolicyId != null && !newCancellationPolicyId.trim().isEmpty();

    if (hasCancellationPolicyUpdate) {
      CancellationPolicy cancellationPolicy = cancellationPolicyRepository.findById(newCancellationPolicyId)
        .orElseThrow(() -> new AppException(ErrorType.CANCELLATION_POLICY_NOT_FOUND));
      room.setCancellationPolicy(cancellationPolicy);
    }

    String newReschedulePolicyId = request.getReschedulePolicyId();
    boolean hasReschedulePolicyUpdate = newReschedulePolicyId != null && !newReschedulePolicyId.trim().isEmpty();

    if (hasReschedulePolicyUpdate) {
      ReschedulePolicy reschedulePolicy = reschedulePolicyRepository.findById(newReschedulePolicyId)
        .orElseThrow(() -> new AppException(ErrorType.RESCHEDULE_POLICY_NOT_FOUND));
      room.setReschedulePolicy(reschedulePolicy);
    }
  }

  @Transactional
  public RoomDetailsResponse delete(String id) {
    Room room = roomRepository.findByIdWithDetails(id)
      .orElseThrow(() -> new AppException(ErrorType.ROOM_NOT_FOUND));

    // Check if room has bookings
    long bookingCount = bookingRepository.countByRoomId(id);
    if (bookingCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_ROOM_HAS_BOOKINGS);
    }

    RoomDetailsResponse response = roomMapper.toRoomDetailsResponse(room);
    roomRepository.delete(room);
    return response;
  }
}