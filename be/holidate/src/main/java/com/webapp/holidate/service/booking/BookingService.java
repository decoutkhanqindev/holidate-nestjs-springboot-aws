package com.webapp.holidate.service.booking;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.constants.api.param.BookingParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.dto.request.booking.BookingCreationRequest;
import com.webapp.holidate.dto.request.booking.BookingPricePreviewRequest;
import com.webapp.holidate.dto.response.acommodation.room.inventory.RoomInventoryPriceByDateResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.dto.response.booking.BookingPriceDetailsResponse;
import com.webapp.holidate.dto.response.booking.BookingResponse;
import com.webapp.holidate.dto.response.booking.FeeResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.booking.Booking;
import com.webapp.holidate.entity.discount.Discount;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.PagedMapper;
import com.webapp.holidate.mapper.booking.BookingMapper;
import com.webapp.holidate.mapper.discount.DiscountMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.accommodation.room.RoomRepository;
import com.webapp.holidate.repository.booking.BookingRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.service.accommodation.room.RoomInventoryService;
import com.webapp.holidate.service.auth.EmailService;
import com.webapp.holidate.service.discount.DiscountService;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.booking.BookingStatusType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class BookingService {
  BookingRepository bookingRepository;
  UserRepository userRepository;
  RoomRepository roomRepository;
  HotelRepository hotelRepository;

  RoomInventoryService roomInventoryService;
  DiscountService discountService;
  PaymentService paymentService;
  EmailService emailService;

  BookingMapper bookingMapper;
  DiscountMapper discountMapper;
  PagedMapper pagedMapper;

  @NonFinal
  @Value(AppProperties.VAT_RATE)
  double vatRate;

  @NonFinal
  @Value(AppProperties.SERVICE_FEE_RATE)
  double serviceFeeRate;

  @Transactional
  public BookingResponse create(BookingCreationRequest request, HttpServletRequest httpRequest) {
    int maxRetries = 3;
    int retryDelay = 100; // milliseconds

    for (int attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return performBookingCreation(request, httpRequest);
      } catch (PessimisticLockingFailureException e) {
        if (attempt == maxRetries) {
          throw new AppException(ErrorType.CONCURRENT_BOOKING_FAILED);
        }

        try {
          Thread.sleep((long) retryDelay * attempt); // Exponential backoff
        } catch (InterruptedException ie) {
          Thread.currentThread().interrupt();
          throw new AppException(ErrorType.UNKNOWN_ERROR);
        }
      }
    }

    throw new AppException(ErrorType.UNKNOWN_ERROR);
  }

  private BookingResponse performBookingCreation(BookingCreationRequest request, HttpServletRequest httpRequest) {
    // Step 1: Validate and fetch entities
    User user = userRepository.findById(request.getUserId())
        .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    Room room = roomRepository.findById(request.getRoomId())
        .orElseThrow(() -> new AppException(ErrorType.ROOM_NOT_FOUND));

    Hotel hotel = hotelRepository.findById(request.getHotelId())
        .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));

    // Validate booking dates
    LocalDate checkInDate = request.getCheckInDate();
    LocalDate checkOutDate = request.getCheckOutDate();
    LocalDate today = LocalDate.now();

    if (checkInDate.isBefore(today)) {
      throw new AppException(ErrorType.CHECK_IN_DATE_INVALID);
    }

    if (checkOutDate.isBefore(checkInDate) || checkOutDate.isEqual(checkInDate)) {
      throw new AppException(ErrorType.CHECK_OUT_DATE_INVALID);
    }

    // Step 2: Validate room capacity based on number of rooms
    int numberOfAdults = request.getNumberOfAdults();
    int numberOfChildren = request.getNumberOfChildren();
    int numberOfRooms = request.getNumberOfRooms();

    // Check if adults fit in the rooms
    if (numberOfAdults > room.getMaxAdults() * numberOfRooms) {
      throw new AppException(ErrorType.ROOM_NOT_AVAILABLE);
    }

    // Check if children fit in the rooms
    if (numberOfChildren > room.getMaxChildren() * numberOfRooms) {
      throw new AppException(ErrorType.ROOM_NOT_AVAILABLE);
    }

    // Step 3: Check room availability and calculate pricing with pessimistic
    // locking
    // This will lock the inventory records to prevent concurrent modifications
    List<RoomInventory> inventories = roomInventoryService.validateRoomAvailability(
        request.getRoomId(), checkInDate, checkOutDate, numberOfRooms);

    double originalPrice = roomInventoryService.calculateOriginalPrice(inventories, numberOfRooms);

    // Step 4: Validate and apply discount
    Discount appliedDiscount = discountService.validateDiscount(request.getDiscountCode(), originalPrice,
        request.getUserId());
    double[] discountAmounts = discountService.calculateDiscountAmount(appliedDiscount, originalPrice);
    double discountAmount = discountAmounts[0];
    double netPriceAfterDiscount = discountAmounts[1];

    // Step 5: Calculate tax and service fee
    double taxAmount = netPriceAfterDiscount * vatRate;
    double serviceFeeAmount = netPriceAfterDiscount * serviceFeeRate;
    double finalPrice = netPriceAfterDiscount + taxAmount + serviceFeeAmount;

    // Step 6: Create booking and update inventory in transaction
    Booking booking = bookingMapper.toEntity(request);

    // Set the fields that were ignored in mapper
    booking.setUser(user);
    booking.setRoom(room);
    booking.setHotel(hotel);
    booking.setNumberOfNights((int) java.time.temporal.ChronoUnit.DAYS.between(checkInDate, checkOutDate));
    booking.setOriginalPrice(originalPrice);
    booking.setDiscountAmount(discountAmount);
    booking.setFinalPrice(finalPrice);
    booking.setAppliedDiscount(appliedDiscount);
    booking.setStatus(BookingStatusType.PENDING_PAYMENT.getValue());

    // Save booking first
    Booking savedBooking = bookingRepository.save(booking);

    // Update room inventory availability atomically (with locks already held)
    roomInventoryService.updateAvailabilityForBooking(
        request.getRoomId(), checkInDate, checkOutDate, numberOfRooms);

    // Update discount usage count if discount was applied
    discountService.updateDiscountUsage(appliedDiscount);

    // Step 7: Generate payment URL using PaymentService
    String paymentUrl = paymentService.createPaymentUrl(savedBooking, httpRequest);

    // Step 8: Return booking response with payment URL
    BookingResponse response = bookingMapper.toBookingResponse(savedBooking, paymentUrl);

    // Calculate price details using helper method
    BookingPriceDetailsResponse priceDetails = calculatePriceDetails(savedBooking);
    response.setPriceDetails(priceDetails);

    if (response.getRoom() != null) {
      // Set pricesByDate for booking period
      List<RoomInventoryPriceByDateResponse> pricesByDate = roomInventoryService.getPricesByDateRange(
          savedBooking.getRoom().getId(),
          savedBooking.getCheckInDate(),
          savedBooking.getCheckOutDate());
      response.getRoom().setPricesByDateRange(pricesByDate);
    }

    return response;
  }

  @Transactional
  public BookingPriceDetailsResponse createPricePreview(BookingPricePreviewRequest request) {
    // Step 1: Validate and fetch room
    Room room = roomRepository.findById(request.getRoomId())
        .orElseThrow(() -> new AppException(ErrorType.ROOM_NOT_FOUND));

    // Step 2: Validate dates
    LocalDate startDate = request.getStartDate();
    LocalDate endDate = request.getEndDate();
    LocalDate today = LocalDate.now();

    if (startDate.isBefore(today)) {
      throw new AppException(ErrorType.CHECK_IN_DATE_INVALID);
    }

    if (endDate.isBefore(startDate) || endDate.isEqual(startDate)) {
      throw new AppException(ErrorType.CHECK_OUT_DATE_INVALID);
    }

    // Step 3: Validate room capacity based on number of rooms
    int numberOfAdults = request.getNumberOfAdults();
    int numberOfChildren = request.getNumberOfChildren();
    int numberOfRooms = request.getNumberOfRooms();

    // Check if adults fit in the rooms
    if (numberOfAdults > room.getMaxAdults() * numberOfRooms) {
      throw new AppException(ErrorType.ROOM_NOT_AVAILABLE);
    }

    // Check if children fit in the rooms
    if (numberOfChildren > room.getMaxChildren() * numberOfRooms) {
      throw new AppException(ErrorType.ROOM_NOT_AVAILABLE);
    }

    // Step 4: Check room availability and calculate pricing
    List<RoomInventory> inventories = roomInventoryService.validateRoomAvailability(
        request.getRoomId(), startDate, endDate, numberOfRooms);

    double originalPrice = roomInventoryService.calculateOriginalPrice(inventories, numberOfRooms);

    // Step 5: Validate and apply discount (without userId for preview)
    Discount appliedDiscount = discountService.validateDiscount(request.getDiscountCode(), originalPrice);
    double[] discountAmounts = discountService.calculateDiscountAmount(appliedDiscount, originalPrice);
    double discountAmount = discountAmounts[0];

    // Step 6: Use helper method to calculate price details
    return calculatePriceDetailsFromValues(originalPrice, discountAmount, appliedDiscount);
  }

  public PagedResponse<BookingResponse> getAll(
      String userId, String roomId, String hotelId, String status,
      LocalDate checkInDate, LocalDate checkOutDate,
      LocalDateTime createdFrom, LocalDateTime createdTo,
      Double minPrice, Double maxPrice,
      String contactEmail, String contactPhone, String contactFullName,
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
        && (BookingParams.CREATED_AT.equals(sortBy) ||
            BookingParams.CHECK_IN_DATE_SORT.equals(sortBy) ||
            BookingParams.CHECK_OUT_DATE_SORT.equals(sortBy) ||
            BookingParams.FINAL_PRICE.equals(sortBy) ||
            BookingParams.STATUS_SORT.equals(sortBy));
    if (!hasSortBy) {
      sortBy = null;
    }

    // Create Pageable with sorting
    Pageable pageable = createPageable(page, size, sortBy, sortDir);

    // Get bookings from database with pagination
    Page<Booking> bookingPage = bookingRepository.findAllWithFiltersPaged(
        userId, roomId, hotelId, status,
        checkInDate, checkOutDate, createdFrom, createdTo,
        minPrice, maxPrice, contactEmail, contactPhone, contactFullName,
        pageable);

    // Check if we have any bookings
    if (bookingPage.isEmpty()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Convert entities to response DTOs with price details
    List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
        .map(booking -> {
          BookingResponse response = bookingMapper.toBookingResponse(booking, null);
          BookingPriceDetailsResponse priceDetails = calculatePriceDetails(booking);
          response.setPriceDetails(priceDetails);

          // Set pricesByDate for booking period
          if (response.getRoom() != null) {
            List<RoomInventoryPriceByDateResponse> pricesByDate = roomInventoryService.getPricesByDateRange(
                booking.getRoom().getId(),
                booking.getCheckInDate(),
                booking.getCheckOutDate());
            response.getRoom().setPricesByDateRange(pricesByDate);
          }

          return response;
        })
        .toList();

    // Create and return paged response with database pagination metadata
    return pagedMapper.createPagedResponse(
        bookingResponses,
        page,
        size,
        bookingPage.getTotalElements(),
        bookingPage.getTotalPages());
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
      case BookingParams.CHECK_IN_DATE_SORT -> "checkInDate";
      case BookingParams.CHECK_OUT_DATE_SORT -> "checkOutDate";
      case BookingParams.FINAL_PRICE -> "finalPrice";
      case BookingParams.STATUS_SORT -> "status";
      case BookingParams.CREATED_AT -> "createdAt";
      default -> "createdAt"; // Default sorting
    };
  }

  @Transactional
  public BookingResponse cancel(String bookingId) {
    Booking booking = bookingRepository.findByIdWithAllRelations(bookingId)
        .orElseThrow(() -> new AppException(ErrorType.BOOKING_NOT_FOUND));

    // Only allow cancellation if the booking is confirmed
    if (!BookingStatusType.CONFIRMED.getValue().equals(booking.getStatus())) {
      throw new AppException(ErrorType.BOOKING_NOT_CONFIRMED);
    }

    // Validate payment exists (required for refund)
    if (booking.getPayment() == null) {
      throw new AppException(ErrorType.BOOKING_NOT_FOUND);
    }

    // Validate room exists (required for releasing inventory)
    if (booking.getRoom() == null) {
      throw new AppException(ErrorType.ROOM_NOT_FOUND);
    }

    // Step 2: Get cancellation policy: prioritize room policy, if not available use
    // hotel policy
    var room = booking.getRoom();
    var roomPolicy = room != null ? room.getCancellationPolicy() : null;
    var hotelPolicy = (booking.getHotel() != null && booking.getHotel().getPolicy() != null)
        ? booking.getHotel().getPolicy().getCancellationPolicy()
        : null;

    var effectivePolicy = roomPolicy != null ? roomPolicy : hotelPolicy;
    double penaltyAmount = 0.0;
    double refundAmount;

    if (effectivePolicy == null || effectivePolicy.getRules() == null || effectivePolicy.getRules().isEmpty()) {
      // No policy → no penalty
      // refund full amount
      refundAmount = booking.getFinalPrice();
      penaltyAmount = 0.0;
      paymentService.refundPayment(booking.getPayment(), refundAmount);

      // Update status & release room in same transaction
      booking.setStatus(BookingStatusType.CANCELLED.getValue());
      booking.setUpdatedAt(LocalDateTime.now());
      roomInventoryService.updateAvailabilityForCancellation(
          booking.getRoom().getId(),
          booking.getCheckInDate(),
          booking.getCheckOutDate(),
          booking.getNumberOfRooms());
      bookingRepository.save(booking);

      // Send refund notification email
      sendRefundEmail(booking, booking.getFinalPrice(), penaltyAmount, refundAmount);

      BookingResponse response = bookingMapper.toBookingResponse(booking, null);
      BookingPriceDetailsResponse priceDetails = calculatePriceDetails(booking);
      response.setPriceDetails(priceDetails);
      if (response.getRoom() != null) {
        List<RoomInventoryPriceByDateResponse> pricesByDate = roomInventoryService.getPricesByDateRange(
            booking.getRoom().getId(), booking.getCheckInDate(), booking.getCheckOutDate());
        response.getRoom().setPricesByDateRange(pricesByDate);
      }
      return response;
    }

    // Step 3: Apply rule based on daysBeforeCheckIn
    LocalDate today = LocalDate.now();
    long daysBeforeCheckIn = java.time.temporal.ChronoUnit.DAYS.between(today, booking.getCheckInDate());
    // Select rule with threshold >= daysBeforeCheckIn and closest; if not
    // available, use the largest rule
    // rule lớn nhất
    var rules = new ArrayList<>(effectivePolicy.getRules());
    rules.sort((a, b) -> Integer.compare(a.getDaysBeforeCheckIn(), b.getDaysBeforeCheckIn()));
    Integer penaltyPercentage = null;
    for (var rule : rules) {
      if (daysBeforeCheckIn <= rule.getDaysBeforeCheckIn()) {
        penaltyPercentage = rule.getPenaltyPercentage();
        break;
      }
    }
    if (penaltyPercentage == null) {
      penaltyPercentage = rules.get(rules.size() - 1).getPenaltyPercentage();
    }

    // Step 4: Calculate refund amount
    penaltyAmount = booking.getFinalPrice() * (penaltyPercentage / 100.0);
    refundAmount = Math.max(0.0, booking.getFinalPrice() - penaltyAmount);

    // Step 5: Refund first, if failed → throw exception and rollback transaction
    paymentService.refundPayment(booking.getPayment(), refundAmount);

    // Step 6: Update booking status and release room inventory in same transaction
    booking.setStatus(BookingStatusType.CANCELLED.getValue());
    booking.setUpdatedAt(LocalDateTime.now());
    roomInventoryService.updateAvailabilityForCancellation(
        booking.getRoom().getId(),
        booking.getCheckInDate(),
        booking.getCheckOutDate(),
        booking.getNumberOfRooms());
    bookingRepository.save(booking);

    // Send refund notification email
    sendRefundEmail(booking, booking.getFinalPrice(), penaltyAmount, refundAmount);

    BookingResponse response = bookingMapper.toBookingResponse(booking, null);
    BookingPriceDetailsResponse priceDetails = calculatePriceDetails(booking);
    response.setPriceDetails(priceDetails);
    if (response.getRoom() != null) {
      List<RoomInventoryPriceByDateResponse> pricesByDate = roomInventoryService.getPricesByDateRange(
          booking.getRoom().getId(), booking.getCheckInDate(), booking.getCheckOutDate());
      response.getRoom().setPricesByDateRange(pricesByDate);
    }
    return response;
  }

  public BookingResponse getById(String id) {
    Booking booking = bookingRepository.findByIdWithAllRelations(id)
        .orElseThrow(() -> new AppException(ErrorType.BOOKING_NOT_FOUND));

    // For existing bookings, paymentUrl is null since payment is already processed
    BookingResponse response = bookingMapper.toBookingResponse(booking, null);

    // Calculate price details
    BookingPriceDetailsResponse priceDetails = calculatePriceDetails(booking);
    response.setPriceDetails(priceDetails);

    // Set pricesByDate for booking period
    if (response.getRoom() != null) {
      List<RoomInventoryPriceByDateResponse> pricesByDate = roomInventoryService.getPricesByDateRange(
          booking.getRoom().getId(),
          booking.getCheckInDate(),
          booking.getCheckOutDate());
      response.getRoom().setPricesByDateRange(pricesByDate);
    }

    return response;
  }

  @Transactional
  public BookingResponse delete(String id) {
    Booking booking = bookingRepository.findByIdWithAllRelations(id)
        .orElseThrow(() -> new AppException(ErrorType.BOOKING_NOT_FOUND));

    // Check if booking can be deleted
    String status = booking.getStatus();
    if (BookingStatusType.CONFIRMED.getValue().equals(status)) {
      throw new AppException(ErrorType.BOOKING_NOT_FOUND); // Using existing error type
    }

    // Create response before deletion
    BookingResponse response = bookingMapper.toBookingResponse(booking, null);
    BookingPriceDetailsResponse priceDetails = calculatePriceDetails(booking);
    response.setPriceDetails(priceDetails);

    // Set pricesByDate for booking period
    if (response.getRoom() != null) {
      List<RoomInventoryPriceByDateResponse> pricesByDate = roomInventoryService.getPricesByDateRange(
          booking.getRoom().getId(),
          booking.getCheckInDate(),
          booking.getCheckOutDate());
      response.getRoom().setPricesByDateRange(pricesByDate);
    }

    // Release room inventory if booking was pending payment
    if (BookingStatusType.PENDING_PAYMENT.getValue().equals(status)) {
      roomInventoryService.updateAvailabilityForCancellation(
          booking.getRoom().getId(),
          booking.getCheckInDate(),
          booking.getCheckOutDate(),
          booking.getNumberOfRooms());
    }

    // Delete the booking (this will also delete related Payment and Review due to
    // cascade)
    bookingRepository.delete(booking);

    return response;
  }

  @Transactional
  public void cancelExpiredBookings() {
    LocalDateTime expiredTime = LocalDateTime.now().minusMinutes(15);

    List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(
        BookingStatusType.PENDING_PAYMENT.getValue(), expiredTime);

    for (Booking booking : expiredBookings) {
      // Update booking status to cancelled
      booking.setStatus(BookingStatusType.CANCELLED.getValue());
      booking.setUpdatedAt(LocalDateTime.now());

      // Release room inventory
      roomInventoryService.updateAvailabilityForCancellation(
          booking.getRoom().getId(),
          booking.getCheckInDate(),
          booking.getCheckOutDate(),
          booking.getNumberOfRooms());

      // Save updated booking
      bookingRepository.save(booking);
    }
  }

  private BookingPriceDetailsResponse calculatePriceDetails(Booking booking) {
    return calculatePriceDetailsFromValues(
        booking.getOriginalPrice(),
        booking.getDiscountAmount(),
        booking.getAppliedDiscount(),
        booking.getFinalPrice());
  }

  private BookingPriceDetailsResponse calculatePriceDetailsFromValues(
      double originalPrice,
      double discountAmount,
      Discount appliedDiscount) {
    return calculatePriceDetailsFromValues(originalPrice, discountAmount, appliedDiscount, null);
  }

  private void sendRefundEmail(Booking booking, double totalAmount, double penaltyAmount, double refundAmount) {
    String customerEmail = booking.getContactEmail();
    String customerName = booking.getContactFullName();
    String hotelName = booking.getHotel() != null ? booking.getHotel().getName() : "N/A";
    String roomName = booking.getRoom() != null ? booking.getRoom().getName() : "N/A";
    String checkInDate = booking.getCheckInDate().toString();
    String checkOutDate = booking.getCheckOutDate().toString();

    emailService.sendRefundNotification(
        customerEmail,
        customerName,
        booking.getId(),
        hotelName,
        roomName,
        checkInDate,
        checkOutDate,
        totalAmount,
        penaltyAmount,
        refundAmount);
  }

  private BookingPriceDetailsResponse calculatePriceDetailsFromValues(
      double originalPrice,
      double discountAmount,
      Discount appliedDiscount,
      Double finalPrice) {
    // Calculate net price after discount
    double netPriceAfterDiscount = originalPrice - discountAmount;

    // Calculate tax and service fee
    double taxAmount = netPriceAfterDiscount * vatRate;
    double serviceFeeAmount = netPriceAfterDiscount * serviceFeeRate;

    // Calculate final price if not provided
    double calculatedFinalPrice = finalPrice != null ? finalPrice
        : netPriceAfterDiscount + taxAmount + serviceFeeAmount;

    // Create FeeResponse objects
    FeeResponse tax = FeeResponse.builder()
        .name("VAT")
        .percentage(vatRate * 100)
        .amount(taxAmount)
        .build();

    FeeResponse serviceFee = FeeResponse.builder()
        .name("Service Fee")
        .percentage(serviceFeeRate * 100)
        .amount(serviceFeeAmount)
        .build();

    // Create BookingPriceDetailsResponse
    return BookingPriceDetailsResponse.builder()
        .originalPrice(originalPrice)
        .discountAmount(discountAmount)
        .appliedDiscount(
            appliedDiscount != null ? discountMapper.toDiscountBriefResponse(appliedDiscount) : null)
        .netPriceAfterDiscount(netPriceAfterDiscount)
        .tax(tax)
        .serviceFee(serviceFee)
        .finalPrice(calculatedFinalPrice)
        .build();
  }
}
