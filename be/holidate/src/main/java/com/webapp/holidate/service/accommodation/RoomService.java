package com.webapp.holidate.service.accommodation;

import com.webapp.holidate.dto.request.acommodation.room.RoomCreationRequest;
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
    processPhotos(room, photos);

    List<String> amenityIds = request.getAmenityIds();
    processAmenities(room, amenityIds);

    roomRepository.save(room);
    return roomMapper.toRoomDetailsResponse(room);
  }

  public List<RoomResponse> getAllByHotelId(String hotelId) {
    return roomRepository.findAllByHotelIdWithBedTypePhotosAmenitiesInventoriesCancellationPolicyReschedulePolicy(hotelId).stream()
        .map(roomMapper::toRoomResponse)
        .toList();
  }

  private void processPhotos(Room room, List<PhotoCreationRequest> photosToAdd) throws IOException {
    boolean hasPhotosToAdd = photosToAdd != null && !photosToAdd.isEmpty();
    if (!hasPhotosToAdd) {
      return;
    }

    Set<RoomPhoto> roomPhotos = new HashSet<>();

    for (PhotoCreationRequest photoRequest : photosToAdd) {
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

  private void processAmenities(Room room, List<String> amenityIds) {
    boolean hasAmenities = amenityIds != null && !amenityIds.isEmpty();
    if (!hasAmenities) {
      return;
    }

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
}
