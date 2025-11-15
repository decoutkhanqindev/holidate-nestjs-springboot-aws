package com.webapp.holidate.service.accommodation;

import com.webapp.holidate.component.room.RoomCandidate;
import com.webapp.holidate.component.room.RoomCombinationFinder;
import com.webapp.holidate.constants.api.param.CommonParams;
import com.webapp.holidate.constants.api.param.HotelParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelUpdateRequest;
import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import com.webapp.holidate.dto.request.location.entertainment_venue.EntertainmentVenueCreationRequest;
import com.webapp.holidate.dto.request.location.entertainment_venue.HotelEntertainmentVenueRequest;
import com.webapp.holidate.dto.request.policy.HotelPolicyRequest;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.amenity.Amenity;
import com.webapp.holidate.entity.amenity.HotelAmenity;
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
import com.webapp.holidate.mapper.PagedMapper;
import com.webapp.holidate.mapper.acommodation.HotelMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.accommodation.room.RoomRepository;
import com.webapp.holidate.repository.amenity.AmenityRepository;
import com.webapp.holidate.repository.amenity.HotelAmenityRepository;
import com.webapp.holidate.repository.booking.BookingRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
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
  BookingRepository bookingRepository;

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
  PagedMapper pagedMapper;

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

  @Transactional(readOnly = true)
  public PagedResponse<HotelResponse> getAll(
      String name, String countryId, String provinceId, String cityId, String districtId,
      String wardId, String streetId, List<String> amenityIds, Integer starRating, String status,
      String partnerId,
      LocalDate checkinDate, LocalDate checkoutDate,
      Integer requiredAdults, Integer requiredChildren, Integer requiredRooms,
      Double minPrice, Double maxPrice,
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
        && (CommonParams.PRICE.equals(sortBy) ||
            HotelParams.STAR_RATING.equals(sortBy) ||
            CommonParams.CREATED_AT.equals(sortBy));
    if (!hasSortBy) {
      sortBy = null;
    }

    // Check what filters are provided
    boolean hasNameFilter = name != null && !name.isEmpty();
    boolean hasLocationFilter = countryId != null || provinceId != null || cityId != null ||
        districtId != null || wardId != null || streetId != null;
    boolean hasAmenityFilter = amenityIds != null && !amenityIds.isEmpty();
    boolean hasStarRatingFilter = starRating != null;
    boolean hasStatusFilter = status != null && !status.isEmpty();
    boolean hasPartnerFilter = partnerId != null && !partnerId.isEmpty();
    boolean hasDateFilter = checkinDate != null || checkoutDate != null;
    boolean hasGuestRequirementsFilter = requiredAdults != null || requiredChildren != null || requiredRooms != null;
    boolean hasPriceFilter = minPrice != null || maxPrice != null;

    boolean hasAnyFilter = hasNameFilter || hasLocationFilter || hasAmenityFilter || hasStarRatingFilter
        || hasStatusFilter || hasPartnerFilter ||
        hasDateFilter || hasGuestRequirementsFilter || hasPriceFilter;

    // If no filters, get all hotels with simple pagination
    if (!hasAnyFilter) {
      return getAllHotelsWithoutFilters(page, size, sortBy, sortDir);
    }

    // If it has filters, use complex filtering logic
    return getHotelsWithFilters(
        name, countryId, provinceId, cityId, districtId, wardId, streetId,
        amenityIds, starRating, status, partnerId, checkinDate, checkoutDate,
        requiredAdults, requiredChildren, requiredRooms,
        minPrice, maxPrice, page, size, sortBy, sortDir);
  }

  // Create Pageable object with sorting
  private Pageable createPageable(int page, int size, String sortBy, String sortDir) {
    if (sortBy == null) {
      return PageRequest.of(page, size);
    }

    // Map sort field to entity field
    String entitySortField = mapSortFieldToEntity(sortBy);
    Sort.Direction direction = SortingParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir)
        ? Sort.Direction.ASC
        : Sort.Direction.DESC;

    Sort sort = Sort.by(direction, entitySortField);
    return PageRequest.of(page, size, sort);
  }

  // Map API sort field to entity field name (only for database-sortable fields)
  private String mapSortFieldToEntity(String sortBy) {
    return switch (sortBy) {
      case HotelParams.STAR_RATING -> "starRating";
      case CommonParams.CREATED_AT -> "createdAt";
      default -> "createdAt"; // Default sorting
    };
  }

  // Check if sort field can be handled at database level
  private boolean canSortAtDatabaseLevel(String sortBy) {
    return sortBy == null ||
        HotelParams.STAR_RATING.equals(sortBy) ||
        CommonParams.CREATED_AT.equals(sortBy);
  }

  // Get all hotels when no filters applied
  private PagedResponse<HotelResponse> getAllHotelsWithoutFilters(int page, int size, String sortBy, String sortDir) {
    // Create Pageable with sorting
    Pageable pageable = createPageable(page, size, sortBy, sortDir);

    // Fetch hotels from database with pagination
    Page<Hotel> hotelPage = hotelRepository.findAllWithDetails(pageable);

    // Check if we have any hotels
    if (hotelPage.isEmpty()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Get hotel IDs and fetch room data and photos separately (to avoid N+1 queries
    // and collection fetch warning)
    List<String> hotelIds = hotelPage.getContent().stream().map(Hotel::getId).toList();
    List<Hotel> hotelsWithRooms = hotelRepository.findAllByIdsWithRoomsAndInventories(hotelIds);
    List<Hotel> hotelsWithPhotos = hotelRepository.findAllByIdsWithPhotos(hotelIds);

    // Merge room data and photos to hotels
    mergeRoomData(hotelPage.getContent(), hotelsWithRooms);
    mergePhotoData(hotelPage.getContent(), hotelsWithPhotos);

    // Convert entities to response DTOs
    List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
        .map(hotelMapper::toHotelResponse)
        .toList();

    // Create and return paged response with database pagination metadata
    return pagedMapper.createPagedResponse(
        hotelResponses,
        page,
        size,
        hotelPage.getTotalElements(),
        hotelPage.getTotalPages());
  }

  // Handle filtering logic when filters are provided
  private PagedResponse<HotelResponse> getHotelsWithFilters(
      String name, String countryId, String provinceId, String cityId, String districtId,
      String wardId, String streetId, List<String> amenityIds, Integer starRating, String status,
      String partnerId,
      LocalDate checkinDate, LocalDate checkoutDate,
      Integer requiredAdults, Integer requiredChildren, Integer requiredRooms,
      Double minPrice, Double maxPrice,
      int page, int size, String sortBy, String sortDir) {
    // Check if we need complex filtering (date/guest requirements) or complex
    // sorting (price)
    boolean hasValidDateRange = checkinDate != null && checkoutDate != null;
    boolean hasGuestRequirements = requiredAdults != null || requiredChildren != null || requiredRooms != null;
    boolean needsComplexFiltering = hasValidDateRange || hasGuestRequirements;
    boolean needsComplexSorting = !canSortAtDatabaseLevel(sortBy);

    // If no complex filtering AND can sort at DB level, use database pagination
    // directly
    if (!needsComplexFiltering && !needsComplexSorting) {
      return getHotelsWithBasicFiltersOnly(
          name, countryId, provinceId, cityId, districtId, wardId, streetId,
          amenityIds, starRating, status, partnerId, minPrice, maxPrice,
          page, size, sortBy, sortDir);
    }

    // Complex filtering or sorting requires application-level processing
    return getHotelsWithComplexFilters(
        name, countryId, provinceId, cityId, districtId, wardId, streetId,
        amenityIds, starRating, status, partnerId, checkinDate, checkoutDate,
        requiredAdults, requiredChildren, requiredRooms,
        minPrice, maxPrice, page, size, sortBy, sortDir);
  }

  // Handle hotels filtering with only basic filters (can use database pagination)
  private PagedResponse<HotelResponse> getHotelsWithBasicFiltersOnly(
      String name, String countryId, String provinceId, String cityId, String districtId,
      String wardId, String streetId, List<String> amenityIds, Integer starRating, String status,
      String partnerId,
      Double minPrice, Double maxPrice,
      int page, int size, String sortBy, String sortDir) {
    // Create pageable with sorting
    Pageable pageable = createPageable(page, size, sortBy, sortDir);

    // Step 1: Filter hotels from database with pagination (direct hotel fetch)
    int requiredAmenityCount = (amenityIds != null) ? amenityIds.size() : 0;
    Page<Hotel> hotelPage = hotelRepository.findAllWithFiltersPaged(
        name, countryId, provinceId, cityId, districtId, wardId, streetId, status, partnerId,
        amenityIds, requiredAmenityCount, starRating, minPrice, maxPrice, pageable);

    // Check if we found any hotels
    if (hotelPage.isEmpty()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Step 2: Get hotel IDs and fetch room data and photos separately (to avoid N+1
    // queries and collection fetch warning)
    List<String> hotelIds = hotelPage.getContent().stream().map(Hotel::getId).toList();
    List<Hotel> hotelsWithRooms = hotelRepository.findAllByIdsWithRoomsAndInventories(hotelIds);
    List<Hotel> hotelsWithPhotos = hotelRepository.findAllByIdsWithPhotos(hotelIds);

    // Step 3: Merge room data and photos while preserving pagination order
    mergeRoomData(hotelPage.getContent(), hotelsWithRooms);
    mergePhotoData(hotelPage.getContent(), hotelsWithPhotos);

    // Step 4: Convert to response DTOs
    List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
        .map(hotelMapper::toHotelResponse)
        .toList();

    // Step 5: Return paged response with database pagination metadata
    return pagedMapper.createPagedResponse(
        hotelResponses,
        page,
        size,
        hotelPage.getTotalElements(),
        hotelPage.getTotalPages());
  }

  // Handle hotels filtering with complex filters (requires application-level
  // pagination)
  private PagedResponse<HotelResponse> getHotelsWithComplexFilters(
      String name, String countryId, String provinceId, String cityId, String districtId,
      String wardId, String streetId, List<String> amenityIds, Integer starRating, String status,
      String partnerId,
      LocalDate checkinDate, LocalDate checkoutDate,
      Integer requiredAdults, Integer requiredChildren, Integer requiredRooms,
      Double minPrice, Double maxPrice,
      int page, int size, String sortBy, String sortDir) {
    // Step 1: Filter hotels from database using basic filters (without pagination)
    int requiredAmenityCount = (amenityIds != null) ? amenityIds.size() : 0;
    List<String> filteredHotelIds = hotelRepository.findAllIdsByFilter(
        name, countryId, provinceId, cityId, districtId, wardId, streetId, status, partnerId,
        amenityIds, requiredAmenityCount, starRating, minPrice, maxPrice);

    // Check if we found any hotels
    boolean hasMatchingHotels = filteredHotelIds != null && !filteredHotelIds.isEmpty();
    if (!hasMatchingHotels) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Step 2: Get detailed hotel info including rooms
    List<Hotel> candidateHotels = hotelRepository.findAllByIds(filteredHotelIds);
    List<Hotel> hotelsWithRooms = hotelRepository.findAllByIdsWithRoomsAndInventories(filteredHotelIds);
    mergeRoomData(candidateHotels, hotelsWithRooms);

    // Step 3: Apply complex filtering
    boolean hasValidDateRange = checkinDate != null && checkoutDate != null;
    boolean hasGuestRequirements = requiredAdults != null || requiredChildren != null || requiredRooms != null;
    boolean needsDateAndGuestValidation = hasValidDateRange && hasGuestRequirements;

    List<Hotel> finalFilteredHotels;

    // Case 1: No date or guest filtering needed
    if (!hasValidDateRange && !hasGuestRequirements) {
      finalFilteredHotels = candidateHotels;
    }
    // Case 2: Only guest filtering needed
    else if (!hasValidDateRange) {
      finalFilteredHotels = filterByGuestRequirementsOnly(candidateHotels, requiredAdults, requiredChildren,
          requiredRooms);
    }
    // Case 3: Date filtering needed (may include guest filtering too)
    else {
      LocalDate validatedCheckoutDate = checkoutDate.isAfter(checkinDate)
          ? checkoutDate
          : checkinDate.plusDays(1);
      long totalNightsStay = ChronoUnit.DAYS.between(checkinDate, validatedCheckoutDate);
      boolean isInvalidStayDuration = totalNightsStay <= 0;

      if (isInvalidStayDuration) {
        return pagedMapper.createEmptyPagedResponse(page, size);
      }

      // Filter based on room availability and capacity
      finalFilteredHotels = filterByAvailabilityAndCapacity(
          candidateHotels, checkinDate, validatedCheckoutDate, totalNightsStay,
          requiredAdults, requiredChildren, requiredRooms, needsDateAndGuestValidation);
    }

    // Step 4: Convert entity objects to response DTOs
    List<HotelResponse> hotelResponses = finalFilteredHotels.stream()
        .map(hotelMapper::toHotelResponse)
        .toList();

    // Step 5: Apply sorting if sort field is specified
    if (sortBy != null) {
      hotelResponses = applySorting(hotelResponses, sortBy, sortDir);
    }

    // Step 6: Apply pagination and return paged response
    return applyPagination(hotelResponses, page, size);
  }

  // Combine room data from separate query into main hotel list
  private void mergeRoomData(List<Hotel> hotels, List<Hotel> hotelsWithRooms) {
    hotels.forEach(hotel -> {
      hotelsWithRooms.stream()
          .filter(h -> h.getId().equals(hotel.getId()))
          .findFirst()
          .ifPresent(h -> hotel.setRooms(h.getRooms()));
    });
  }

  // Combine photo data from separate query into main hotel list
  private void mergePhotoData(List<Hotel> hotels, List<Hotel> hotelsWithPhotos) {
    hotels.forEach(hotel -> {
      hotelsWithPhotos.stream()
          .filter(h -> h.getId().equals(hotel.getId()))
          .findFirst()
          .ifPresent(h -> hotel.setPhotos(h.getPhotos()));
    });
  }

  // Filter hotels based only on guest capacity requirements
  private List<Hotel> filterByGuestRequirementsOnly(
      List<Hotel> candidateHotels,
      Integer requiredAdults, Integer requiredChildren, Integer requiredRooms) {
    return candidateHotels.stream()
        .filter(hotel -> {
          Set<Room> rooms = hotel.getRooms();
          boolean hasAvailableRooms = rooms != null && !rooms.isEmpty();
          if (!hasAvailableRooms) {
            return false;
          }
          return hasCapacityForRequirements(rooms, requiredAdults, requiredChildren, requiredRooms);
        })
        .toList();
  }

  // Filter hotels based on room availability by date and guest capacity
  private List<Hotel> filterByAvailabilityAndCapacity(
      List<Hotel> candidateHotels,
      LocalDate checkinDate, LocalDate checkoutDate, long totalNightsStay,
      Integer requiredAdults, Integer requiredChildren, Integer requiredRooms,
      boolean needsDateAndGuestValidation) {
    return candidateHotels.stream()
        .filter(hotel -> isHotelAvailable(
            hotel, checkinDate, checkoutDate, totalNightsStay,
            requiredAdults, requiredChildren, requiredRooms,
            needsDateAndGuestValidation))
        .toList();
  }

  // Check if specific hotel has available rooms and meets capacity requirements
  private boolean isHotelAvailable(
      Hotel hotel,
      LocalDate checkinDate, LocalDate checkoutDate, long totalNightsStay,
      Integer requiredAdults, Integer requiredChildren, Integer requiredRooms,
      boolean needsDateAndGuestValidation) {
    // Step 1: Check if rooms are available for the date range
    List<RoomCandidate> availableRoomCandidates = roomRepository.findAvailableRoomCandidates(
        hotel.getId(), checkinDate, checkoutDate, totalNightsStay);
    boolean hasAvailableRooms = availableRoomCandidates != null && !availableRoomCandidates.isEmpty();

    if (!hasAvailableRooms) {
      return false; // No rooms available for these dates
    }

    // Step 2: If needed, check guest capacity too
    if (needsDateAndGuestValidation) {
      int adultsRequired = requiredAdults != null ? requiredAdults : 0;
      int childrenRequired = requiredChildren != null ? requiredChildren : 0;
      int roomsRequired = requiredRooms != null ? requiredRooms : 1;

      // Find valid room combinations
      List<List<Room>> validCombinations = roomCombinationFinder.findCombinations(
          availableRoomCandidates, adultsRequired, childrenRequired, roomsRequired);
      return !validCombinations.isEmpty(); // Return true if at least one combination found
    } else {
      // Only checking dates, and we already passed (hasAvailableRooms is true)
      return true;
    }
  }

  // Check if hotel rooms can accommodate the guest requirements
  private boolean hasCapacityForRequirements(
      Set<Room> hotelRooms,
      Integer requiredAdults,
      Integer requiredChildren,
      Integer requiredRooms) {
    // First check if hotel has any rooms at all
    boolean hasAvailableRooms = hotelRooms != null && !hotelRooms.isEmpty();
    if (!hasAvailableRooms) {
      return false;
    }

    // If no guest requirements specified, any hotel with rooms is fine
    boolean hasNoGuestRequirements = requiredAdults == null && requiredChildren == null && requiredRooms == null;
    if (hasNoGuestRequirements) {
      return true;
    }

    // Convert null values to 0 for calculations
    int adultsToAccommodate = requiredAdults != null ? requiredAdults : 0;
    int childrenToAccommodate = requiredChildren != null ? requiredChildren : 0;
    int roomsNeeded = requiredRooms != null ? requiredRooms : (adultsToAccommodate + childrenToAccommodate > 0 ? 1 : 0);

    // If no guests and no rooms needed, accept any hotel
    boolean noGuestsNoRoomsRequired = adultsToAccommodate == 0 && childrenToAccommodate == 0 && roomsNeeded == 0;
    if (noGuestsNoRoomsRequired) {
      return true;
    }

    // If only rooms needed but no guests, just check room count
    boolean onlyRoomsRequiredNoGuests = adultsToAccommodate == 0 && childrenToAccommodate == 0 && roomsNeeded > 0;
    if (onlyRoomsRequiredNoGuests) {
      return hotelRooms.size() >= roomsNeeded;
    }

    // Invalid case: guests specified but no rooms
    boolean hasGuestsButNoRooms = (adultsToAccommodate > 0 || childrenToAccommodate > 0) && roomsNeeded == 0;
    if (hasGuestsButNoRooms) {
      return false; // Having guests but no room requirements is invalid
    }

    // Sort rooms by capacity (largest first) for optimal allocation
    List<Room> roomsSortedByCapacity = hotelRooms.stream()
        .sorted((room1, room2) -> Integer.compare(
            room2.getMaxAdults() + room2.getMaxChildren(),
            room1.getMaxAdults() + room1.getMaxChildren()))
        .toList();

    // Check if sorted rooms can accommodate all guests
    return canAccommodateGuests(roomsSortedByCapacity, adultsToAccommodate, childrenToAccommodate, roomsNeeded);
  }

  // Check if available rooms can fit all required guests
  private boolean canAccommodateGuests(
      List<Room> availableRooms,
      int totalAdultsRequired,
      int totalChildrenRequired,
      int totalRoomsRequired) {
    // First check if we have enough rooms available
    boolean hasSufficientRooms = availableRooms.size() >= totalRoomsRequired;
    if (!hasSufficientRooms) {
      return false;
    }

    // Track remaining guests that need accommodation
    int adultsStillNeedAccommodation = totalAdultsRequired;
    int childrenStillNeedAccommodation = totalChildrenRequired;
    int roomsCurrentlyUsed = 0;

    // Try to place guests room by room
    for (Room currentRoom : availableRooms) {
      // Stop if we've used enough rooms
      if (roomsCurrentlyUsed >= totalRoomsRequired) {
        break;
      }

      // Stop if all guests are accommodated
      if (adultsStillNeedAccommodation <= 0 && childrenStillNeedAccommodation <= 0) {
        break;
      }

      // Calculate how many adults can fit in this room
      int adultsCanFitInThisRoom = Math.min(adultsStillNeedAccommodation, currentRoom.getMaxAdults());

      // Calculate how many children can fit considering adults already placed
      int childrenCanFitInThisRoom = getChildrenCanFitInThisRoom(currentRoom, childrenStillNeedAccommodation,
          adultsCanFitInThisRoom);

      // Update remaining guests and room count
      adultsStillNeedAccommodation -= adultsCanFitInThisRoom;
      childrenStillNeedAccommodation -= childrenCanFitInThisRoom;
      roomsCurrentlyUsed++;
    }

    // Check if all requirements are met
    boolean allGuestsAccommodated = adultsStillNeedAccommodation <= 0 && childrenStillNeedAccommodation <= 0;
    boolean withinRoomLimit = roomsCurrentlyUsed <= totalRoomsRequired;

    return allGuestsAccommodated && withinRoomLimit;
  }

  // Calculate how many children can fit in current room considering adults
  // already placed
  private int getChildrenCanFitInThisRoom(
      Room currentRoom, int childrenStillNeedAccommodation, int adultsCanFitInThisRoom) {
    // Step 1: Calculate initial children that can fit based on room max children
    // limit
    int childrenCanFitInThisRoom = Math.min(childrenStillNeedAccommodation, currentRoom.getMaxChildren());

    // Step 2: Check if total guests would exceed room capacity
    int totalGuestsInRoom = adultsCanFitInThisRoom + childrenCanFitInThisRoom;
    int maxRoomCapacity = currentRoom.getMaxAdults() + currentRoom.getMaxChildren();

    // Step 3: If room would be overcrowded, recalculate children capacity
    if (totalGuestsInRoom > maxRoomCapacity) {
      // Only adjust if adults fit within adult limit
      if (adultsCanFitInThisRoom <= currentRoom.getMaxAdults()) {
        // Calculate remaining capacity after placing adults
        int remainingCapacity = maxRoomCapacity - adultsCanFitInThisRoom;
        // Limit children to remaining capacity
        childrenCanFitInThisRoom = Math.min(childrenStillNeedAccommodation, remainingCapacity);
      }
    }

    // Return final number of children that can fit
    return childrenCanFitInThisRoom;
  }

  // Apply pagination to hotel responses list
  private PagedResponse<HotelResponse> applyPagination(List<HotelResponse> hotelResponses, int page, int size) {
    // Step 1: Calculate pagination metadata
    long totalElements = hotelResponses.size();
    int totalPages = (int) Math.ceil((double) totalElements / size);

    // Step 2: Handle empty result case
    if (totalElements == 0) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Step 3: Calculate page boundaries for current page
    int startIndex = page * size;
    int endIndex = Math.min(startIndex + size, hotelResponses.size());

    // Step 4: Handle page out of range case
    if (startIndex >= hotelResponses.size()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Step 5: Extract content for current page
    List<HotelResponse> content = hotelResponses.subList(startIndex, endIndex);

    // Step 6: Create and return paged response with metadata
    return pagedMapper.createPagedResponse(content, page, size, totalElements, totalPages);
  }

  // Sort hotel responses by specified field and direction
  private List<HotelResponse> applySorting(List<HotelResponse> hotelResponses, String sortBy, String sortDir) {
    // Step 1: Determine sort direction (ascending or descending)
    boolean isAscending = SortingParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir);

    // Step 2: Apply sorting using stream with custom comparator
    return hotelResponses.stream()
        .sorted((h1, h2) -> {
          // Step 3: Compare values based on sort field
          int comparison = switch (sortBy) {
            case CommonParams.PRICE ->
              // Compare price per night (double values)
              Double.compare(h1.getCurrentPricePerNight(), h2.getCurrentPricePerNight());
            case HotelParams.STAR_RATING ->
              // Compare star rating (integer values)
              Integer.compare(h1.getStarRating(), h2.getStarRating());
            case CommonParams.CREATED_AT ->
              // Compare creation date (LocalDateTime values)
              h1.getCreatedAt().compareTo(h2.getCreatedAt());
            default ->
              // Return 0 for unknown sort fields (no sorting)
              0;
          };

          // Step 4: Reverse comparison for descending order
          return isAscending ? comparison : -comparison;
        })
        .toList();
  }

  @Transactional(readOnly = true)
  public HotelDetailsResponse getById(String id) {
    Hotel hotel = hotelRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));
    return hotelMapper.toHotelDetailsResponse(hotel);
  }

  @Transactional
  public HotelDetailsResponse update(String id, HotelUpdateRequest request) throws IOException {
    Hotel hotel = hotelRepository.findByIdWithDetails(id)
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

        Double distance = venueRequest.getDistance();
        if (distance == null || distance <= 0) {
          throw new AppException(ErrorType.INVALID_DISTANCE_VALUE);
        }

        HotelEntertainmentVenue hotelVenue = HotelEntertainmentVenue.builder()
            .hotel(hotel)
            .entertainmentVenue(newVenue)
            .distance(distance)
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

          Integer distance = venueRequest.getDistance();
          if (distance == null || distance <= 0) {
            throw new AppException(ErrorType.INVALID_DISTANCE_VALUE);
          }

          HotelEntertainmentVenue hotelVenue = HotelEntertainmentVenue.builder()
              .hotel(hotel)
              .entertainmentVenue(entertainmentVenue)
              .distance(distance)
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
        Integer newDistance = venueRequest.getDistance();
        if (newDistance == null || newDistance <= 0) {
          throw new AppException(ErrorType.INVALID_DISTANCE_VALUE);
        }

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

  @Transactional
  public HotelDetailsResponse delete(String id) {
    Hotel hotel = hotelRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));

    // Check if hotel has rooms
    long roomCount = roomRepository.countByHotelId(id);
    if (roomCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_HOTEL_HAS_ROOMS);
    }

    // Check if hotel has bookings
    long bookingCount = bookingRepository.countByHotelId(id);
    if (bookingCount > 0) {
      throw new AppException(ErrorType.CANNOT_DELETE_HOTEL_HAS_BOOKINGS);
    }

    HotelDetailsResponse response = hotelMapper.toHotelDetailsResponse(hotel);
    hotelRepository.delete(hotel);
    return response;
  }
}