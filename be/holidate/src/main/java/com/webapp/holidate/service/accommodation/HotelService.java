package com.webapp.holidate.service.accommodation;

import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.location.*;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.acommodation.HotelMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
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
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class HotelService {
  HotelRepository hotelRepository;
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

    List<MultipartFile> photoFiles = request.getPhotos();
    List<String> photoUrls = new ArrayList<>();
    boolean canUploadPhotos = photoFiles != null && !photoFiles.isEmpty();
    if (canUploadPhotos) {
      for (MultipartFile photoFile : photoFiles) {
        boolean canUploadFile = photoFile != null && !photoFile.isEmpty();
        if (canUploadFile) {
          fileService.upload(photoFile);
          String fileName = photoFile.getOriginalFilename();
          String photoUrl = fileService.createFileUrl(fileName);
          photoUrls.add(photoUrl);
        }
      }
    }
    hotel.setPhotoUrls(photoUrls);

    hotelRepository.save(hotel);
    return hotelMapper.toHotelResponse(hotel);
  }

  public List<HotelResponse> getAll() {
    List<Hotel> hotels = hotelRepository.findAllWithLocationsAndPartner();
    List<HotelResponse> hotelResponses = new ArrayList<>();

    for (Hotel hotel : hotels) {
      double fakeVndPrice = genFakeVndPrice();
      HotelResponse response = hotelMapper.toHotelResponse(hotel);
      response.setRawPricePerNight(fakeVndPrice);
      response.setCurrentPricePerNight(fakeVndPrice * 0.8);
      hotelResponses.add(response);
    }

    return hotelResponses;
  }

  private double genFakeVndPrice() {
    return Math.round((100000 + Math.random() * 900000) / 1000.0) * 1000.0;
  }
}