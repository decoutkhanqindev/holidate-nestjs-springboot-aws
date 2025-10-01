package com.webapp.holidate.service.accommodation;

import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelUpdateRequest;
import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import com.webapp.holidate.dto.request.image.PhotoDeleteRequest;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.image.Photo;
import com.webapp.holidate.entity.image.PhotoCategory;
import com.webapp.holidate.entity.location.*;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.acommodation.HotelMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.image.HotelPhotoRepository;
import com.webapp.holidate.repository.image.PhotoCategoryRepository;
import com.webapp.holidate.repository.image.PhotoRepository;
import com.webapp.holidate.repository.location.*;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.service.storage.FileService;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
  FileService fileService;

  HotelMapper hotelMapper;

  public HotelResponse create(HotelCreationRequest request) throws IOException {
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

    hotelRepository.save(hotel);

    List<PhotoCreationRequest> photoRequests = request.getPhotos();
    boolean hasPhotos = photoRequests != null && !photoRequests.isEmpty();
    if (hasPhotos) {
      Set<HotelPhoto> hotelPhotos = new HashSet<>();

      for (PhotoCreationRequest photoRequest : photoRequests) {
        String categoryId = photoRequest.getCategoryId();
        PhotoCategory category = photoCategoryRepository.findById(categoryId)
          .orElseThrow(() -> new AppException(ErrorType.PHOTO_CATEGORY_NOT_FOUND));

        MultipartFile file = photoRequest.getFile();
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
        HotelPhoto savedHotelPhoto = hotelPhotoRepository.save(hotelPhoto);
        hotelPhotos.add(savedHotelPhoto);
      }

      hotel.setPhotos(hotelPhotos);
      hotelRepository.save(hotel);
    }

    return hotelMapper.toHotelResponse(hotel);
  }

  public List<HotelResponse> getAll() {
    return hotelRepository.findAllWithLocationsPhotosPartner()
      .stream()
      .map(hotelMapper::toHotelResponse)
      .toList();
  }

  public HotelResponse update(String id, HotelUpdateRequest request) throws IOException {
    Hotel hotel = hotelRepository.findByIdWithLocationsPhotosAmenitiesReviewsPartner(id)
      .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));

    hotelMapper.updateEntity(hotel, request);

    String newName = request.getName();
    String currentName = hotel.getName();
    boolean nameChanged = newName != null && !currentName.equals(newName);
    if (nameChanged) {
      boolean nameExists = hotelRepository.existsByName(newName);
      if (nameExists) {
        throw new AppException(ErrorType.HOTEL_EXISTS);
      }
      hotel.setName(newName);
    }

    updateLocation(hotel, request);

    updatePhotos(hotel, request);

    hotelRepository.save(hotel);
    return hotelMapper.toHotelResponse(hotel);
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

    List<PhotoDeleteRequest> photosToDelete = request.getPhotosToDelete();
    boolean hasPhotosToDelete = photosToDelete != null && !photosToDelete.isEmpty();
    if (hasPhotosToDelete) {
      List<String> photoIdsToDelete = photosToDelete.stream()
        .map(PhotoDeleteRequest::getId)
        .toList();
      currentPhotos.removeIf(hotelPhoto -> photoIdsToDelete.contains(hotelPhoto.getPhoto().getId()));
      photoRepository.deleteAllById(photoIdsToDelete);
    }

    List<PhotoCreationRequest> photosToAdd = request.getPhotosToAdd();
    boolean hasPhotosToAdd = photosToAdd != null && !photosToAdd.isEmpty();
    if (hasPhotosToAdd) {
      for (PhotoCreationRequest photoToAdd : photosToAdd) {
        String categoryId = photoToAdd.getCategoryId();
        PhotoCategory category = photoCategoryRepository.findById(categoryId)
          .orElseThrow(() -> new AppException(ErrorType.PHOTO_CATEGORY_NOT_FOUND));

        MultipartFile file = photoToAdd.getFile();
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

    hotel.setPhotos(currentPhotos);
  }
}