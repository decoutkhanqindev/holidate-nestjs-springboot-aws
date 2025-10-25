package com.webapp.holidate.service.discount;

import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.constants.api.param.DiscountParams;
import com.webapp.holidate.dto.request.discount.DiscountCreationRequest;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.dto.response.discount.DiscountDetailsResponse;
import com.webapp.holidate.dto.response.discount.DiscountResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.discount.Discount;
import com.webapp.holidate.entity.discount.HotelDiscount;
import com.webapp.holidate.entity.discount.SpecialDayDiscount;
import com.webapp.holidate.entity.special_day.SpecialDay;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.PagedMapper;
import com.webapp.holidate.mapper.acommodation.HotelMapper;
import com.webapp.holidate.mapper.discount.DiscountMapper;
import com.webapp.holidate.mapper.special_day.SpecialDayMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.discount.DiscountRepository;
import com.webapp.holidate.repository.discount.HotelDiscountRepository;
import com.webapp.holidate.repository.discount.SpecialDayDiscountRepository;
import com.webapp.holidate.repository.special_day.SpecialDayRepository;
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

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DiscountService {
  DiscountRepository discountRepository;

  HotelDiscountRepository hotelDiscountRepository;
  HotelRepository hotelRepository;

  SpecialDayDiscountRepository specialDayDiscountRepository;
  SpecialDayRepository specialDayRepository;

  DiscountMapper mapper;
  HotelMapper hotelMapper;
  SpecialDayMapper specialDayMapper;
  PagedMapper pagedMapper;

  public DiscountResponse create(DiscountCreationRequest request, String hotelId, String specialDayId) {
    if (discountRepository.existsByCode(request.getCode())) {
      throw new AppException(ErrorType.DISCOUNT_EXISTS);
    }

    Discount discount = mapper.toEntity(request);
    discountRepository.save(discount);

    if (hotelId != null) {
      Hotel hotel = hotelRepository.findById(hotelId)
          .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));
      HotelDiscount hotelDiscount = mapper.toEntity(discount, hotel);
      hotelDiscountRepository.save(hotelDiscount);
    }

    if (specialDayId != null) {
      SpecialDay specialDay = specialDayRepository.findById(specialDayId)
          .orElseThrow(() -> new AppException(ErrorType.SPECIAL_DAY_NOT_FOUND));
      SpecialDayDiscount specialDayDiscount = mapper.toEntity(discount, specialDay);
      specialDayDiscountRepository.save(specialDayDiscount);
    }

    return mapper.toDiscountResponse(discount);
  }

  public PagedResponse<DiscountResponse> getAll(
      String code, Boolean active, Boolean currentlyValid, LocalDate validFrom, LocalDate validTo,
      Double minPercentage, Double maxPercentage, Integer minBookingPrice, Integer maxBookingPrice,
      Integer minBookingCount, Integer maxBookingCount, Boolean available, Boolean exhausted,
      Integer minTimesUsed, Integer maxTimesUsed, String hotelId, String specialDayId,
      int page, int size, String sortBy, String sortDir) {
    // Clean up page and size values
    page = Math.max(0, page);
    size = Math.min(Math.max(1, size), 100);

    // Check if sort direction is valid
    boolean hasSortDir = sortDir != null && !sortDir.isEmpty()
        && (SortingParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir) ||
            SortingParams.SORT_DIR_DESC.equalsIgnoreCase(sortDir));
    if (!hasSortDir) {
      sortDir = SortingParams.SORT_DIR_ASC;
    }

    // Check if sort field is valid
    boolean hasSortBy = sortBy != null && !sortBy.isEmpty()
        && (isValidSortField(sortBy));
    if (!hasSortBy) {
      sortBy = null;
    }

    // Check what filters are provided
    boolean hasCodeFilter = code != null && !code.isEmpty();
    boolean hasActiveFilter = active != null;
    boolean hasCurrentlyValidFilter = currentlyValid != null;
    boolean hasDateFilter = validFrom != null || validTo != null;
    boolean hasPercentageFilter = minPercentage != null || maxPercentage != null;
    boolean hasBookingPriceFilter = minBookingPrice != null || maxBookingPrice != null;
    boolean hasBookingCountFilter = minBookingCount != null || maxBookingCount != null;
    boolean hasUsageFilter = available != null || exhausted != null || minTimesUsed != null || maxTimesUsed != null;
    boolean hasRelationshipFilter = hotelId != null || specialDayId != null;

    boolean hasAnyFilter = hasCodeFilter || hasActiveFilter || hasCurrentlyValidFilter || hasDateFilter
        || hasPercentageFilter || hasBookingPriceFilter || hasBookingCountFilter || hasUsageFilter
        || hasRelationshipFilter;

    // If no filters, get all discounts with simple pagination
    if (!hasAnyFilter) {
      return getAllDiscountsWithoutFilters(page, size, sortBy, sortDir);
    }

    // If it has filters, use database-level filtering with pagination
    return getDiscountsWithFilters(
        code, active, currentlyValid, validFrom, validTo,
        minPercentage, maxPercentage, minBookingPrice, maxBookingPrice,
        minBookingCount, maxBookingCount, available, exhausted,
        minTimesUsed, maxTimesUsed, hotelId, specialDayId,
        page, size, sortBy, sortDir);
  }

  // Check if sort field is valid for discounts
  private boolean isValidSortField(String sortBy) {
    return DiscountParams.PERCENTAGE.equals(sortBy) ||
        DiscountParams.VALID_FROM.equals(sortBy) ||
        DiscountParams.VALID_TO.equals(sortBy) ||
        DiscountParams.USAGE_LIMIT.equals(sortBy) ||
        DiscountParams.TIMES_USED.equals(sortBy) ||
        DiscountParams.MIN_BOOKING_PRICE.equals(sortBy) ||
        DiscountParams.CODE.equals(sortBy) ||
        DiscountParams.CREATED_AT.equals(sortBy);
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

  // Map API sort field to entity field name
  private String mapSortFieldToEntity(String sortBy) {
    return switch (sortBy) {
      case DiscountParams.PERCENTAGE -> "percentage";
      case DiscountParams.VALID_FROM -> "validFrom";
      case DiscountParams.VALID_TO -> "validTo";
      case DiscountParams.USAGE_LIMIT -> "usageLimit";
      case DiscountParams.TIMES_USED -> "timesUsed";
      case DiscountParams.MIN_BOOKING_PRICE -> "minBookingPrice";
      case DiscountParams.CODE -> "code";
      case DiscountParams.CREATED_AT -> "createdAt";
      default -> "id"; // Default sorting
    };
  }

  // Get all discounts when no filters applied
  private PagedResponse<DiscountResponse> getAllDiscountsWithoutFilters(int page, int size, String sortBy,
      String sortDir) {
    // Create Pageable with sorting
    Pageable pageable = createPageable(page, size, sortBy, sortDir);

    // Fetch discounts from database with pagination
    Page<Discount> discountPage = discountRepository.findAll(pageable);

    // Check if we have any discounts
    if (discountPage.isEmpty()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Convert entities to response DTOs
    List<DiscountResponse> discountResponses = discountPage.getContent().stream()
        .map(mapper::toDiscountResponse)
        .toList();

    // Create and return paged response with database pagination metadata
    return pagedMapper.createPagedResponse(
        discountResponses,
        page,
        size,
        discountPage.getTotalElements(),
        discountPage.getTotalPages());
  }

  // Handle filtering logic when filters are provided
  private PagedResponse<DiscountResponse> getDiscountsWithFilters(
      String code, Boolean active, Boolean currentlyValid, LocalDate validFrom, LocalDate validTo,
      Double minPercentage, Double maxPercentage, Integer minBookingPrice, Integer maxBookingPrice,
      Integer minBookingCount, Integer maxBookingCount, Boolean available, Boolean exhausted,
      Integer minTimesUsed, Integer maxTimesUsed, String hotelId, String specialDayId,
      int page, int size, String sortBy, String sortDir) {

    // Create pageable with sorting
    Pageable pageable = createPageable(page, size, sortBy, sortDir);

    // Get filtered results from database with pagination
    Page<Discount> discountPage = discountRepository.findAllWithFilters(
        code, active, currentlyValid, validFrom, validTo,
        minPercentage, maxPercentage, minBookingPrice, maxBookingPrice,
        minBookingCount, maxBookingCount, available, exhausted,
        minTimesUsed, maxTimesUsed, hotelId, specialDayId,
        pageable);

    // Check if we found any discounts
    if (discountPage.isEmpty()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Convert entities to response DTOs
    List<DiscountResponse> discountResponses = discountPage.getContent().stream()
        .map(mapper::toDiscountResponse)
        .toList();

    // Create and return paged response with database pagination metadata
    return pagedMapper.createPagedResponse(
        discountResponses,
        page,
        size,
        discountPage.getTotalElements(),
        discountPage.getTotalPages());
  }

  public DiscountResponse getByCode(String code) {
    return discountRepository.findByCode(code)
        .map(mapper::toDiscountResponse)
        .orElse(null);
  }

  @Transactional
  public DiscountDetailsResponse getById(String id) {
    Discount discount = discountRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new AppException(ErrorType.DISCOUNT_NOT_FOUND));

    // Get hotel information if exists
    var hotelDiscount = hotelDiscountRepository.findByDiscountId(id);
    Hotel hotel = hotelDiscount.map(HotelDiscount::getHotel).orElse(null);

    // Get special day information if exists
    var specialDayDiscount = specialDayDiscountRepository.findByDiscountId(id);
    SpecialDay specialDay = specialDayDiscount.map(SpecialDayDiscount::getSpecialDay).orElse(null);

    // Create response with hotel and special day details
    DiscountDetailsResponse response = mapper.toDiscountDetailsResponse(discount);
    if (hotel != null) {
      response.setHotel(hotelMapper.toHotelBriefResponse(hotel));
    }
    if (specialDay != null) {
      response.setSpecialDay(specialDayMapper.toSpecialDayResponse(specialDay));
    }

    return response;
  }
}
