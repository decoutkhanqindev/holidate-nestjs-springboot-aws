package com.webapp.holidate.service.accommodation;

import com.webapp.holidate.dto.request.acommodation.room.RoomCreationRequest;
import com.webapp.holidate.dto.request.acommodation.room.RoomUpdateRequest;
import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import com.webapp.holidate.dto.response.acommodation.room.RoomDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import com.webapp.holidate.entity.accommodation.amenity.RoomAmenity;
import com.webapp.holidate.entity.accommodation.room.BedType;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.image.Photo;
import com.webapp.holidate.entity.image.PhotoCategory;
import com.webapp.holidate.entity.image.RoomPhoto;
import com.webapp.holidate.entity.policy.cancelation.CancellationPolicy;
import com.webapp.holidate.entity.policy.reschedule.ReschedulePolicy;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.acommodation.RoomMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.accommodation.room.BedTypeRepository;
import com.webapp.holidate.repository.accommodation.room.RoomInventoryRepository;
import com.webapp.holidate.repository.accommodation.room.RoomRepository;
import com.webapp.holidate.repository.amenity.AmenityRepository;
import com.webapp.holidate.repository.amenity.RoomAmenityRepository;
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
@RequiredArgsConstructor()
public class RoomService {
  HotelRepository hotelRepository;
  RoomRepository roomRepository;
  BedTypeRepository bedTypeRepository;
  RoomInventoryRepository roomInventoryRepository;
  CancellationPolicyRepository cancellationPolicyRepository;
  ReschedulePolicyRepository reschedulePolicyRepository;
  AmenityRepository amenityRepository;
  RoomAmenityRepository roomAmenityRepository;
  PhotoCategoryRepository photoCategoryRepository;
  PhotoRepository photoRepository;
  RoomPhotoRepository roomPhotoRepository;

  FileService fileService;

  RoomMapper roomMapper;

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

  public List<RoomResponse> getAllByHotelId(String hotelId) {
    return roomRepository
        .findAllByHotelIdWithBedTypePhotosAmenitiesInventoriesCancellationPolicyReschedulePolicy(hotelId).stream()
        .map(roomMapper::toRoomResponse)
        .toList();
  }

  @Transactional
  public RoomDetailsResponse update(String id, RoomUpdateRequest request) throws IOException {
    Room room = roomRepository.findById(id)
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
}
