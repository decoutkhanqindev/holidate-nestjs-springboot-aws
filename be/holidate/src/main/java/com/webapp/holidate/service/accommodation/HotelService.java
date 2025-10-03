package com.webapp.holidate.service.accommodation;

import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelUpdateRequest;
import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import com.webapp.holidate.entity.accommodation.amenity.HotelAmenity;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.image.Photo;
import com.webapp.holidate.entity.image.PhotoCategory;
import com.webapp.holidate.entity.location.*;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.acommodation.HotelMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.amenity.AmenityRepository;
import com.webapp.holidate.repository.amenity.HotelAmenityRepository;
import com.webapp.holidate.repository.image.HotelPhotoRepository;
import com.webapp.holidate.repository.image.PhotoCategoryRepository;
import com.webapp.holidate.repository.image.PhotoRepository;
import com.webapp.holidate.repository.location.*;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.service.storage.FileService;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.HotelStatusType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class HotelService {
  HotelRepository hotelRepository;
  PhotoCategoryRepository photoCategoryRepository;
  PhotoRepository photoRepository;
  HotelPhotoRepository hotelPhotoRepository;
  UserRepository userRepository;
  CountryRepository countryRepository;
  ProvinceRepository provinceRepository;
  CityRepository cityRepository;
  DistrictRepository districtRepository;
  WardRepository wardRepository;
  StreetRepository streetRepository;
  AmenityRepository amenityRepository;
  HotelAmenityRepository hotelAmenityRepository;

  FileService fileService;

  HotelMapper hotelMapper;

  public HotelDetailsResponse create(HotelCreationRequest request) throws IOException {
    String name = request.getName();
    boolean nameExists = hotelRepository.existsByName(name);
    if (nameExists) {
      throw new AppException(ErrorType.HOTEL_EXISTS);
    }

    Hotel hotel = hotelMapper.toEntity(request);

    String partnerId = request.getPartnerId();
    User partner = userRepository.findById(partnerId)
        .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    hotel.setPartner(partner);

    String countryId = request.getCountryId();
    Country country = countryRepository.findById(countryId)
        .orElseThrow(() -> new AppException(ErrorType.COUNTRY_NOT_FOUND));
    hotel.setCountry(country);

    String provinceId = request.getProvinceId();
    Province province = provinceRepository.findById(provinceId)
        .orElseThrow(() -> new AppException(ErrorType.PROVINCE_NOT_FOUND));
    hotel.setProvince(province);

    String cityId = request.getCityId();
    City city = cityRepository.findById(cityId)
        .orElseThrow(() -> new AppException(ErrorType.CITY_NOT_FOUND));
    hotel.setCity(city);

    String districtId = request.getDistrictId();
    District district = districtRepository.findById(districtId)
        .orElseThrow(() -> new AppException(ErrorType.DISTRICT_NOT_FOUND));
    hotel.setDistrict(district);

    String wardId = request.getWardId();
    Ward ward = wardRepository.findById(wardId)
        .orElseThrow(() -> new AppException(ErrorType.WARD_NOT_FOUND));
    hotel.setWard(ward);

    String streetId = request.getStreetId();
    Street street = streetRepository.findById(streetId)
        .orElseThrow(() -> new AppException(ErrorType.STREET_NOT_FOUND));
    hotel.setStreet(street);

    hotel.setStatus(HotelStatusType.INACTIVE.getValue());

    hotelRepository.save(hotel);
    return hotelMapper.toHotelDetailsResponse(hotel);
  }

  public List<HotelResponse> getAll() {
    return hotelRepository.findAllWithLocationsPhotosPartner()
        .stream()
        .map(hotelMapper::toHotelResponse)
        .toList();
  }

  public HotelDetailsResponse getById(String id) {
    Hotel hotel = hotelRepository.findByIdWithLocationsPhotosAmenitiesReviewsPartner(id)
        .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));
    return hotelMapper.toHotelDetailsResponse(hotel);
  }

  public HotelDetailsResponse update(String id, HotelUpdateRequest request) throws IOException {
    Hotel hotel = hotelRepository.findByIdWithLocationsPhotosAmenitiesReviewsPartner(id)
        .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));

    updateInfo(hotel, request);
    updateLocation(hotel, request);
    updatePhotos(hotel, request);
    updateAmenities(hotel, request);

    hotelRepository.save(hotel);
    return hotelMapper.toHotelDetailsResponse(hotel);
  }

  private void updateInfo(Hotel hotel, HotelUpdateRequest request) {
    String newName = request.getName();
    boolean nameChanged = newName != null && !newName.equals(hotel.getName());
    if (nameChanged) {
      boolean nameExists = hotelRepository.existsByName(newName);
      if (nameExists) {
        throw new AppException(ErrorType.HOTEL_EXISTS);
      }
      hotel.setName(newName);
    }

    String newDescription = request.getDescription();
    boolean descriptionChanged = newDescription != null && !newDescription.equals(hotel.getDescription());
    if (descriptionChanged) {
      hotel.setDescription(newDescription);
    }

    String newStatus = request.getStatus();
    boolean statusChanged = newStatus != null && !newStatus.equals(hotel.getStatus());
    if (statusChanged) {
      hotel.setStatus(newStatus);
    }

    LocalDateTime now = LocalDateTime.now();
    hotel.setUpdatedAt(now);
  }

  private void updateLocation(Hotel hotel, HotelUpdateRequest request) {
    String newAddress = request.getAddress();
    String currentAddress = hotel.getAddress();
    boolean addressChanged = newAddress != null && !currentAddress.equals(newAddress);
    if (addressChanged) {
      hotel.setAddress(newAddress);
    }

    String newCountryId = request.getCountryId();
    String currentCountryId = hotel.getCountry().getId();
    boolean countryChanged = newCountryId != null && !currentCountryId.equals(newCountryId);
    if (countryChanged) {
      Country country = countryRepository.findById(newCountryId)
          .orElseThrow(() -> new AppException(ErrorType.COUNTRY_NOT_FOUND));
      hotel.setCountry(country);
    }

    String newProvinceId = request.getProvinceId();
    String currentProvinceId = hotel.getProvince().getId();
    boolean provinceChanged = newProvinceId != null && !currentProvinceId.equals(newProvinceId);
    if (provinceChanged) {
      Province province = provinceRepository.findById(newProvinceId)
          .orElseThrow(() -> new AppException(ErrorType.PROVINCE_NOT_FOUND));
      hotel.setProvince(province);
    }

    String newCityId = request.getCityId();
    String currentCityId = hotel.getCity().getId();
    boolean cityChanged = newCityId != null && !currentCityId.equals(newCityId);
    if (cityChanged) {
      City city = cityRepository.findById(newCityId)
          .orElseThrow(() -> new AppException(ErrorType.CITY_NOT_FOUND));
      hotel.setCity(city);
    }

    String newDistrictId = request.getDistrictId();
    String currentDistrictId = hotel.getDistrict().getId();
    boolean districtChanged = newDistrictId != null && !currentDistrictId.equals(newDistrictId);
    if (districtChanged) {
      District district = districtRepository.findById(newDistrictId)
          .orElseThrow(() -> new AppException(ErrorType.DISTRICT_NOT_FOUND));
      hotel.setDistrict(district);
    }

    String newWardId = request.getWardId();
    String currentWardId = hotel.getWard().getId();
    boolean wardChanged = newWardId != null && !currentWardId.equals(newWardId);
    if (wardChanged) {
      Ward ward = wardRepository.findById(newWardId)
          .orElseThrow(() -> new AppException(ErrorType.WARD_NOT_FOUND));
      hotel.setWard(ward);
    }

    String newStreetId = request.getStreetId();
    String currentStreetId = hotel.getStreet().getId();
    boolean streetChanged = newStreetId != null && !currentStreetId.equals(newStreetId);
    if (streetChanged) {
      Street street = streetRepository.findById(newStreetId)
          .orElseThrow(() -> new AppException(ErrorType.STREET_NOT_FOUND));
      hotel.setStreet(street);
    }

    Double newLatitude = request.getLatitude();
    double currentLatitude = hotel.getLatitude();
    boolean latitudeChanged = newLatitude != null && currentLatitude != newLatitude;
    if (latitudeChanged) {
      hotel.setLatitude(newLatitude);
    }

    Double newLongitude = request.getLongitude();
    double currentLongitude = hotel.getLongitude();
    boolean longitudeChanged = newLongitude != null && currentLongitude != newLongitude;
    if (longitudeChanged) {
      hotel.setLongitude(newLongitude);
    }
  }

  private void updatePhotos(Hotel hotel, HotelUpdateRequest request) throws IOException {
    Set<HotelPhoto> currentPhotos = hotel.getPhotos();

    List<String> photoIdsToDelete = request.getPhotoIdsToDelete();
    boolean hasPhotosToDelete = photoIdsToDelete != null && !photoIdsToDelete.isEmpty();
    if (hasPhotosToDelete) {
      List<HotelPhoto> hotelPhotosToDelete = currentPhotos.stream()
          .filter(hotelPhoto -> photoIdsToDelete.contains(hotelPhoto.getPhoto().getId()))
          .toList();
      hotelPhotosToDelete.forEach(currentPhotos::remove);

      for (HotelPhoto hotelPhoto : hotelPhotosToDelete) {
        hotelPhotoRepository.delete(hotelPhoto);
      }

      for (String photoId : photoIdsToDelete) {
        Photo photo = photoRepository.findById(photoId)
            .orElseThrow(() -> new AppException(ErrorType.PHOTO_NOT_FOUND));
        String fileUrl = photo.getUrl();
        fileService.delete(fileUrl);
        photoRepository.delete(photo);
      }
    }

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

              HotelPhoto hotelPhoto = HotelPhoto.builder()
                  .photo(photo)
                  .hotel(hotel)
                  .build();
              hotelPhotoRepository.save(hotelPhoto);
              currentPhotos.add(hotelPhoto);
            }
          }
        }
      }
    }

    hotel.setPhotos(currentPhotos);
  }

  private void updateAmenities(Hotel hotel, HotelUpdateRequest request) {
    Set<HotelAmenity> currentAmenities = hotel.getAmenities();

    List<String> amenityIdsToRemove = request.getAmenityIdsToRemove();
    boolean hasAmenitiesToRemove = amenityIdsToRemove != null && !amenityIdsToRemove.isEmpty();
    if (hasAmenitiesToRemove) {
      currentAmenities.removeIf(hotelAmenity -> amenityIdsToRemove.contains(hotelAmenity.getAmenity().getId()));
    }

    List<String> amenityIdsToAdd = request.getAmenityIdsToAdd();
    boolean hasAmenitiesToAdd = amenityIdsToAdd != null && !amenityIdsToAdd.isEmpty();
    if (hasAmenitiesToAdd) {
      Set<String> existingAmenityIds = currentAmenities.stream()
          .map(hotelAmenity -> hotelAmenity.getAmenity().getId())
          .collect(Collectors.toSet());

      for (String amenityId : amenityIdsToAdd) {
        boolean alreadyExists = existingAmenityIds.contains(amenityId);
        if (!alreadyExists) {
          Amenity amenity = amenityRepository.findById(amenityId)
              .orElseThrow(() -> new AppException(ErrorType.AMENITY_NOT_FOUND));

          HotelAmenity hotelAmenity = HotelAmenity.builder()
              .hotel(hotel)
              .amenity(amenity)
              .build();

          hotelAmenityRepository.save(hotelAmenity);
          currentAmenities.add(hotelAmenity);
        }
      }
    }

    hotel.setAmenities(currentAmenities);
  }
}