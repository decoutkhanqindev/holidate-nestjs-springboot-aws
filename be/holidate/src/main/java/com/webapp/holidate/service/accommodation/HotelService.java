package com.webapp.holidate.service.accommodation;

import com.webapp.holidate.component.room.RoomCandidate;
import com.webapp.holidate.component.room.RoomCombinationFinder;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelUpdateRequest;
import com.webapp.holidate.dto.request.location.entertainment_venue.HotelEntertainmentVenueRequest;
import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import com.webapp.holidate.dto.request.location.entertainment_venue.EntertainmentVenueCreationRequest;
import com.webapp.holidate.dto.request.policy.HotelPolicyRequest;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import com.webapp.holidate.entity.accommodation.amenity.HotelAmenity;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.document.HotelPolicyIdentificationDocument;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.image.Photo;
import com.webapp.holidate.entity.image.PhotoCategory;
import com.webapp.holidate.entity.location.*;
import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenue;
import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenueCategory;
import com.webapp.holidate.entity.location.entertainment_venue.HotelEntertainmentVenue;
import com.webapp.holidate.entity.policy.HotelPolicy;
import com.webapp.holidate.entity.policy.cancelation.CancellationPolicy;
import com.webapp.holidate.entity.policy.reschedule.ReschedulePolicy;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.acommodation.HotelMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.accommodation.room.RoomRepository;
import com.webapp.holidate.repository.amenity.AmenityRepository;
import com.webapp.holidate.repository.amenity.HotelAmenityRepository;
import com.webapp.holidate.repository.document.HotelPolicyIdentificationDocumentRepository;
import com.webapp.holidate.repository.document.IdentificationDocumentRepository;
import com.webapp.holidate.repository.image.HotelPhotoRepository;
import com.webapp.holidate.repository.image.PhotoCategoryRepository;
import com.webapp.holidate.repository.image.PhotoRepository;
import com.webapp.holidate.repository.location.*;
import com.webapp.holidate.repository.location.entertainment_venue.EntertainmentVenueCategoryRepository;
import com.webapp.holidate.repository.location.entertainment_venue.EntertainmentVenueRepository;
import com.webapp.holidate.repository.location.entertainment_venue.HotelEntertainmentVenueRepository;
import com.webapp.holidate.repository.policy.HotelPolicyRepository;
import com.webapp.holidate.repository.policy.cancellation.CancellationPolicyRepository;
import com.webapp.holidate.repository.policy.resechedule.ReschedulePolicyRepository;
import com.webapp.holidate.repository.user.UserRepository;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
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
  RoomRepository roomRepository;

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
  EntertainmentVenueCategoryRepository entertainmentVenueCategoryRepository;
  EntertainmentVenueRepository entertainmentVenueRepository;
  HotelEntertainmentVenueRepository hotelEntertainmentVenueRepository;

  AmenityRepository amenityRepository;
  HotelAmenityRepository hotelAmenityRepository;
  HotelPolicyRepository hotelPolicyRepository;
  CancellationPolicyRepository cancellationPolicyRepository;
  ReschedulePolicyRepository reschedulePolicyRepository;
  HotelPolicyIdentificationDocumentRepository hotelPolicyIdentificationDocumentRepository;
  IdentificationDocumentRepository identificationDocumentRepository;

  FileService fileService;

  RoomCombinationFinder roomCombinationFinder;

  HotelMapper hotelMapper;

  @Transactional
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

    hotel.setStatus(AccommodationStatusType.INACTIVE.getValue());

    hotelRepository.save(hotel);
    return hotelMapper.toHotelDetailsResponse(hotel);
  }

  public List<HotelResponse> getAll(
      String countryId, String provinceId, String cityId, String districtId,
      String wardId, String streetId, List<String> amenityIds, Integer starRating,
      LocalDate checkinDate, LocalDate checkoutDate,
      Integer requiredAdults, Integer requiredChildren, Integer requiredRooms,
      Double minPrice, Double maxPrice) {
    boolean hasLocationFilter = countryId != null || provinceId != null || cityId != null ||
        districtId != null || wardId != null || streetId != null;
    boolean hasAmenityFilter = amenityIds != null && !amenityIds.isEmpty();
    boolean hasStarRatingFilter = starRating != null;
    boolean hasDateFilter = checkinDate != null || checkoutDate != null;
    boolean hasGuestRequirementsFilter = requiredAdults != null || requiredChildren != null || requiredRooms != null;
    boolean hasPriceFilter = minPrice != null || maxPrice != null;

    boolean hasAnyFilter = hasLocationFilter || hasAmenityFilter || hasStarRatingFilter ||
        hasDateFilter || hasGuestRequirementsFilter || hasPriceFilter;

    if (!hasAnyFilter) {
      List<Hotel> allHotelsFromDb = hotelRepository.findAllWithLocationsPhotosPolicy();
      boolean hasAnyHotelsInDb = allHotelsFromDb != null && !allHotelsFromDb.isEmpty();

      if (hasAnyHotelsInDb) {
        List<String> hotelIds = allHotelsFromDb.stream().map(Hotel::getId).toList();
        List<Hotel> hotelsWithRooms = hotelRepository.findAllByIdsWithRoomsAndInventories(hotelIds);

        allHotelsFromDb.forEach(hotel -> {
          hotelsWithRooms.stream()
              .filter(h -> h.getId().equals(hotel.getId()))
              .findFirst()
              .ifPresent(h -> hotel.setRooms(h.getRooms()));
        });

        return allHotelsFromDb.stream()
            .map(hotelMapper::toHotelResponse)
            .toList();
      }

      return List.of();
    }

    int requiredAmenityCount = (amenityIds != null) ? amenityIds.size() : 0;
    List<String> filteredHotelIds = hotelRepository.findAllIdsByFilter(
        countryId, provinceId, cityId, districtId, wardId, streetId,
        amenityIds, requiredAmenityCount, starRating, minPrice, maxPrice);
    boolean hasMatchingHotels = filteredHotelIds != null && !filteredHotelIds.isEmpty();

    if (!hasMatchingHotels) {
      return List.of();
    }

    List<Hotel> candidateHotels = hotelRepository.findAllByIdsFilterWithLocationsPhotosPolicy(filteredHotelIds);
    List<Hotel> hotelsWithRooms = hotelRepository.findAllByIdsWithRoomsAndInventories(filteredHotelIds);

    candidateHotels.forEach(hotel -> {
      hotelsWithRooms.stream()
          .filter(h -> h.getId().equals(hotel.getId()))
          .findFirst()
          .ifPresent(h -> hotel.setRooms(h.getRooms()));
    });

    boolean hasValidDateRange = checkinDate != null && checkoutDate != null;
    boolean hasGuestRequirements = requiredAdults != null || requiredChildren != null || requiredRooms != null;
    boolean needsDateAndGuestValidation = hasValidDateRange && hasGuestRequirements;

    if (!hasValidDateRange && !hasGuestRequirements) {
      return candidateHotels.stream()
          .map(hotelMapper::toHotelResponse)
          .toList();
    }

    if (!hasValidDateRange) {
      return candidateHotels.stream()
          .filter(hotel -> {
            Set<Room> rooms = hotel.getRooms();
            if (rooms == null || rooms.isEmpty()) {
              return false;
            }

            return hasCapacityForRequirements(rooms, requiredAdults, requiredChildren, requiredRooms);
          })
          .map(hotelMapper::toHotelResponse)
          .toList();
    }

    final LocalDate validatedCheckinDate = checkinDate;
    final LocalDate validatedCheckoutDate = checkoutDate.isAfter(validatedCheckinDate)
        ? checkoutDate
        : validatedCheckinDate.plusDays(1);
    final long totalNightsStay = ChronoUnit.DAYS.between(validatedCheckinDate, validatedCheckoutDate);
    boolean isInvalidStayDuration = totalNightsStay <= 0;

    if (isInvalidStayDuration) {
      return new ArrayList<>();
    }

    List<Hotel> availableHotels = candidateHotels.stream()
        .filter(hotel -> {
          List<RoomCandidate> availableRoomCandidates = roomRepository.findAvailableRoomCandidates(
              hotel.getId(), validatedCheckinDate, validatedCheckoutDate, totalNightsStay);
          boolean hasAvailableRooms = availableRoomCandidates != null && !availableRoomCandidates.isEmpty();

          if (!hasAvailableRooms) {
            return false;
          }

          if (needsDateAndGuestValidation) {
            int adultsRequired = requiredAdults != null ? requiredAdults : 0;
            int childrenRequired = requiredChildren != null ? requiredChildren : 0;
            int roomsRequired = requiredRooms != null ? requiredRooms : 1; // Default 1 room if not specified

            List<List<Room>> validCombinations = roomCombinationFinder.findCombinations(
                availableRoomCandidates, adultsRequired, childrenRequired, roomsRequired);
            return !validCombinations.isEmpty();
          } else {
            return true;
          }
        })
        .toList();

    return availableHotels.stream()
        .map(hotelMapper::toHotelResponse)
        .toList();
  }

  public HotelDetailsResponse getById(String id) {
    Hotel hotel = hotelRepository.findByIdWithLocationsPhotosAmenitiesReviewsPartnerPolicy(id)
        .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));
    return hotelMapper.toHotelDetailsResponse(hotel);
  }

  @Transactional
  public HotelDetailsResponse update(String id, HotelUpdateRequest request) throws IOException {
    Hotel hotel = hotelRepository.findByIdWithLocationsPhotosAmenitiesReviewsPartnerPolicy(id)
        .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));

    updateInfo(hotel, request);
    updateLocation(hotel, request);
    updateEntertainmentVenues(hotel, request);
    updatePhotos(hotel, request);
    updateAmenities(hotel, request);
    updatePolicy(hotel, request);

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

  private void updateEntertainmentVenues(Hotel hotel, HotelUpdateRequest request) {
    Set<HotelEntertainmentVenue> currentVenues = hotel.getEntertainmentVenues();

    List<EntertainmentVenueCreationRequest> newVenueRequests = request.getEntertainmentVenuesToAdd();
    boolean hasNewVenues = newVenueRequests != null && !newVenueRequests.isEmpty();
    if (hasNewVenues) {
      for (EntertainmentVenueCreationRequest venueRequest : newVenueRequests) {
        City city = cityRepository.findById(venueRequest.getCityId())
            .orElseThrow(() -> new AppException(ErrorType.CITY_NOT_FOUND));

        String categoryId = venueRequest.getCategoryId();
        EntertainmentVenueCategory category = entertainmentVenueCategoryRepository
            .findById(categoryId)
            .orElseThrow(() -> new AppException(ErrorType.ENTERTAINMENT_VENUE_CATEGORY_NOT_FOUND));

        EntertainmentVenue newVenue = EntertainmentVenue.builder()
            .name(venueRequest.getName())
            .city(city)
            .category(category)
            .build();

        entertainmentVenueRepository.save(newVenue);

        HotelEntertainmentVenue hotelVenue = HotelEntertainmentVenue.builder()
            .hotel(hotel)
            .entertainmentVenue(newVenue)
            .distance(venueRequest.getDistance())
            .build();

        hotelEntertainmentVenueRepository.save(hotelVenue);
        currentVenues.add(hotelVenue);
      }
    }

    List<String> venueIdsToRemove = request.getEntertainmentVenueIdsToRemove();
    boolean hasVenuesToRemove = venueIdsToRemove != null && !venueIdsToRemove.isEmpty();
    if (hasVenuesToRemove) {
      List<HotelEntertainmentVenue> venuesToRemove = currentVenues.stream()
          .filter(hotelVenue -> venueIdsToRemove.contains(hotelVenue.getEntertainmentVenue().getId()))
          .toList();

      for (HotelEntertainmentVenue venueToRemove : venuesToRemove) {
        hotelEntertainmentVenueRepository.delete(venueToRemove);
        currentVenues.remove(venueToRemove);
      }
    }

    List<HotelEntertainmentVenueRequest> venuesWithDistanceToAdd = request
        .getEntertainmentVenuesWithDistanceToAdd();
    boolean hasVenuesWithDistanceToAdd = venuesWithDistanceToAdd != null && !venuesWithDistanceToAdd.isEmpty();
    if (hasVenuesWithDistanceToAdd) {
      Set<String> existingVenueIds = currentVenues.stream()
          .map(hotelVenue -> hotelVenue.getEntertainmentVenue().getId())
          .collect(Collectors.toSet());

      for (HotelEntertainmentVenueRequest venueRequest : venuesWithDistanceToAdd) {
        String venueId = venueRequest.getEntertainmentVenueId();
        boolean alreadyExists = existingVenueIds.contains(venueId);
        if (!alreadyExists) {
          EntertainmentVenue entertainmentVenue = entertainmentVenueRepository.findById(venueId)
              .orElseThrow(() -> new AppException(ErrorType.ENTERTAINMENT_VENUE_NOT_FOUND));

          HotelEntertainmentVenue hotelVenue = HotelEntertainmentVenue.builder()
              .hotel(hotel)
              .entertainmentVenue(entertainmentVenue)
              .distance(venueRequest.getDistance())
              .build();

          hotelEntertainmentVenueRepository.save(hotelVenue);
          currentVenues.add(hotelVenue);
        }
      }
    }

    List<HotelEntertainmentVenueRequest> venuesWithDistanceToUpdate = request
        .getEntertainmentVenuesWithDistanceToUpdate();
    boolean hasVenuesWithDistanceToUpdate = venuesWithDistanceToUpdate != null && !venuesWithDistanceToUpdate.isEmpty();
    if (hasVenuesWithDistanceToUpdate) {
      for (HotelEntertainmentVenueRequest venueRequest : venuesWithDistanceToUpdate) {
        String venueId = venueRequest.getEntertainmentVenueId();
        int newDistance = venueRequest.getDistance();

        HotelEntertainmentVenue existingVenue = currentVenues.stream()
            .filter(hotelVenue -> hotelVenue.getEntertainmentVenue().getId().equals(venueId))
            .findFirst()
            .orElseThrow(() -> new AppException(ErrorType.ENTERTAINMENT_VENUE_NOT_FOUND));

        if (existingVenue.getDistance() != newDistance) {
          existingVenue.setDistance(newDistance);
          hotelEntertainmentVenueRepository.save(existingVenue);
        }
      }
    }

    hotel.setEntertainmentVenues(currentVenues);
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

  private void updatePolicy(Hotel hotel, HotelUpdateRequest request) {
    HotelPolicyRequest policyRequest = request.getPolicy();
    boolean hasPolicyToUpdate = policyRequest != null;
    if (!hasPolicyToUpdate) {
      return;
    }

    HotelPolicy policy = hotel.getPolicy();
    boolean hasPolicy = policy != null;

    if (!hasPolicy) {
      LocalTime checkInTime = policyRequest.getCheckInTime() != null ? policyRequest.getCheckInTime()
          : LocalTime.of(14, 0);
      LocalTime checkOutTime = policyRequest.getCheckOutTime() != null ? policyRequest.getCheckOutTime()
          : LocalTime.of(12, 0);
      boolean allowsPayAtHotel = policyRequest.getAllowsPayAtHotel() != null ? policyRequest.getAllowsPayAtHotel()
          : false;

      policy = HotelPolicy.builder()
          .hotel(hotel)
          .checkInTime(checkInTime)
          .checkOutTime(checkOutTime)
          .allowsPayAtHotel(allowsPayAtHotel)
          .build();
      hotelPolicyRepository.save(policy);
      hotel.setPolicy(policy);
    }

    LocalTime newCheckInTime = policyRequest.getCheckInTime();
    boolean checkInTimeChanged = newCheckInTime != null && !newCheckInTime.equals(policy.getCheckInTime());
    if (checkInTimeChanged) {
      policy.setCheckInTime(newCheckInTime);
    }

    LocalTime newCheckOutTime = policyRequest.getCheckOutTime();
    boolean checkOutTimeChanged = newCheckOutTime != null && !newCheckOutTime.equals(policy.getCheckOutTime());
    if (checkOutTimeChanged) {
      policy.setCheckOutTime(newCheckOutTime);
    }

    Boolean newAllowsPayAtHotel = policyRequest.getAllowsPayAtHotel();
    boolean allowsPayAtHotelChanged = newAllowsPayAtHotel != null
        && !newAllowsPayAtHotel.equals(policy.isAllowsPayAtHotel());
    if (allowsPayAtHotelChanged) {
      policy.setAllowsPayAtHotel(newAllowsPayAtHotel);
    }

    CancellationPolicy currentCancellationPolicy = policy.getCancellationPolicy();
    String currentCancellationPolicyId = currentCancellationPolicy != null ? currentCancellationPolicy.getId() : null;

    String newCancellationPolicyId = policyRequest.getCancellationPolicyId();
    boolean cancellationPolicyChanged = newCancellationPolicyId != null
        && !newCancellationPolicyId.equals(currentCancellationPolicyId);
    if (cancellationPolicyChanged) {
      CancellationPolicy newCancellationPolicy = cancellationPolicyRepository.findById(newCancellationPolicyId)
          .orElseThrow(() -> new AppException(ErrorType.CANCELLATION_POLICY_NOT_FOUND));
      policy.setCancellationPolicy(newCancellationPolicy);
    }

    ReschedulePolicy currentReschedulePolicy = policy.getReschedulePolicy();
    String currentReschedulePolicyId = currentReschedulePolicy != null ? currentReschedulePolicy.getId() : null;

    String newReschedulePolicyId = policyRequest.getReschedulePolicyId();
    boolean reschedulePolicyChanged = newReschedulePolicyId != null
        && !newReschedulePolicyId.equals(currentReschedulePolicyId);
    if (reschedulePolicyChanged) {
      ReschedulePolicy newReschedulePolicy = reschedulePolicyRepository.findById(newReschedulePolicyId)
          .orElseThrow(() -> new AppException(ErrorType.RESCHEDULE_POLICY_NOT_FOUND));
      policy.setReschedulePolicy(newReschedulePolicy);
    }

    updateRequiredIdentificationDocuments(policy, policyRequest);

    hotelPolicyRepository.save(policy);
  }

  private void updateRequiredIdentificationDocuments(HotelPolicy policy, HotelPolicyRequest policyRequest) {
    Set<HotelPolicyIdentificationDocument> currentDocuments = policy.getRequiredIdentificationDocuments();

    List<String> documentIdsToRemove = policyRequest.getRequiredIdentificationDocumentIdsToRemove();
    boolean hasDocumentsToRemove = documentIdsToRemove != null && !documentIdsToRemove.isEmpty();
    if (hasDocumentsToRemove) {
      List<HotelPolicyIdentificationDocument> documentsToRemove = currentDocuments.stream()
          .filter(policyDoc -> documentIdsToRemove.contains(policyDoc.getIdentificationDocument().getId()))
          .toList();

      for (HotelPolicyIdentificationDocument documentToRemove : documentsToRemove) {
        currentDocuments.remove(documentToRemove);
        hotelPolicyIdentificationDocumentRepository.delete(documentToRemove);
      }
    }

    List<String> documentIdsToAdd = policyRequest.getRequiredIdentificationDocumentIdsToAdd();
    boolean hasDocumentsToAdd = documentIdsToAdd != null && !documentIdsToAdd.isEmpty();
    if (hasDocumentsToAdd) {
      Set<String> existingDocumentIds = currentDocuments.stream()
          .map(policyDoc -> policyDoc.getIdentificationDocument().getId())
          .collect(Collectors.toSet());

      for (String documentId : documentIdsToAdd) {
        boolean alreadyExists = existingDocumentIds.contains(documentId);
        if (!alreadyExists) {
          var identificationDocument = identificationDocumentRepository.findById(documentId)
              .orElseThrow(() -> new AppException(ErrorType.IDENTIFICATION_DOCUMENT_NOT_FOUND));

          HotelPolicyIdentificationDocument policyDocument = HotelPolicyIdentificationDocument.builder()
              .hotelPolicy(policy)
              .identificationDocument(identificationDocument)
              .build();

          hotelPolicyIdentificationDocumentRepository.save(policyDocument);
          currentDocuments.add(policyDocument);
        }
      }
    }

    policy.setRequiredIdentificationDocuments(currentDocuments);
  }

  private boolean hasCapacityForRequirements(
      Set<Room> hotelRooms,
      Integer requiredAdults,
      Integer requiredChildren,
      Integer requiredRooms) {
    boolean hasAvailableRooms = hotelRooms != null && !hotelRooms.isEmpty();
    if (!hasAvailableRooms) {
      return false;
    }

    boolean hasNoGuestRequirements = requiredAdults == null && requiredChildren == null && requiredRooms == null;
    if (hasNoGuestRequirements) {
      return true;
    }

    int adultsToAccommodate = requiredAdults != null ? requiredAdults : 0;
    int childrenToAccommodate = requiredChildren != null ? requiredChildren : 0;
    int roomsNeeded = requiredRooms != null ? requiredRooms : (adultsToAccommodate + childrenToAccommodate > 0 ? 1 : 0);

    boolean noGuestsNoRoomsRequired = adultsToAccommodate == 0 && childrenToAccommodate == 0 && roomsNeeded == 0;
    if (noGuestsNoRoomsRequired) {
      return true;
    }

    boolean onlyRoomsRequiredNoGuests = adultsToAccommodate == 0 && childrenToAccommodate == 0 && roomsNeeded > 0;
    if (onlyRoomsRequiredNoGuests) {
      return hotelRooms.size() >= roomsNeeded;
    }

    boolean hasGuestsButNoRooms = (adultsToAccommodate > 0 || childrenToAccommodate > 0) && roomsNeeded == 0;
    if (hasGuestsButNoRooms) {
      return false; // Có khách nhưng không yêu cầu phòng là không hợp lý
    }

    List<Room> roomsSortedByCapacity = hotelRooms.stream()
        .sorted((room1, room2) -> Integer.compare(
            room2.getMaxAdults() + room2.getMaxChildren(),
            room1.getMaxAdults() + room1.getMaxChildren()))
        .toList();

    return canAccommodateGuests(roomsSortedByCapacity, adultsToAccommodate, childrenToAccommodate, roomsNeeded);
  }

  private boolean canAccommodateGuests(
      List<Room> availableRooms,
      int totalAdultsRequired,
      int totalChildrenRequired,
      int totalRoomsRequired) {
    boolean hasSufficientRooms = availableRooms.size() >= totalRoomsRequired;
    if (!hasSufficientRooms) {
      return false;
    }

    int adultsStillNeedAccommodation = totalAdultsRequired;
    int childrenStillNeedAccommodation = totalChildrenRequired;
    int roomsCurrentlyUsed = 0;

    for (Room currentRoom : availableRooms) {
      if (roomsCurrentlyUsed >= totalRoomsRequired) {
        break;
      }

      if (adultsStillNeedAccommodation <= 0 && childrenStillNeedAccommodation <= 0) {
        break;
      }

      int adultsCanFitInThisRoom = Math.min(adultsStillNeedAccommodation, currentRoom.getMaxAdults());
      int childrenCanFitInThisRoom = getChildrenCanFitInThisRoom(currentRoom, childrenStillNeedAccommodation,
          adultsCanFitInThisRoom);

      adultsStillNeedAccommodation -= adultsCanFitInThisRoom;
      childrenStillNeedAccommodation -= childrenCanFitInThisRoom;
      roomsCurrentlyUsed++;
    }

    boolean allGuestsAccommodated = adultsStillNeedAccommodation <= 0 && childrenStillNeedAccommodation <= 0;
    boolean withinRoomLimit = roomsCurrentlyUsed <= totalRoomsRequired;

    return allGuestsAccommodated && withinRoomLimit;
  }

  private int getChildrenCanFitInThisRoom(Room currentRoom, int childrenStillNeedAccommodation,
      int adultsCanFitInThisRoom) {
    int childrenCanFitInThisRoom = Math.min(childrenStillNeedAccommodation, currentRoom.getMaxChildren());

    int totalGuestsInRoom = adultsCanFitInThisRoom + childrenCanFitInThisRoom;
    int maxRoomCapacity = currentRoom.getMaxAdults() + currentRoom.getMaxChildren();

    if (totalGuestsInRoom > maxRoomCapacity) {
      if (adultsCanFitInThisRoom <= currentRoom.getMaxAdults()) {
        int remainingCapacity = maxRoomCapacity - adultsCanFitInThisRoom;
        childrenCanFitInThisRoom = Math.min(childrenStillNeedAccommodation, remainingCapacity);
      }
    }
    return childrenCanFitInThisRoom;
  }
}
