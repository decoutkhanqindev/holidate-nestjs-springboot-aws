package com.webapp.holidate.service.booking;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.dto.request.booking.BookingCreationRequest;
import com.webapp.holidate.dto.request.booking.BookingPricePreviewRequest;
import com.webapp.holidate.dto.response.booking.BookingPricePreviewResponse;
import com.webapp.holidate.dto.response.booking.BookingResponse;
import com.webapp.holidate.dto.response.booking.FeeResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.booking.Booking;
import com.webapp.holidate.entity.discount.Discount;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.booking.BookingMapper;
import com.webapp.holidate.mapper.discount.DiscountMapper;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.accommodation.room.RoomRepository;
import com.webapp.holidate.repository.booking.BookingRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.service.accommodation.room.RoomInventoryService;
import com.webapp.holidate.service.discount.DiscountService;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.booking.BookingStatusType;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

  BookingMapper mapper;
  DiscountMapper discountMapper;

  @NonFinal
  @Value(AppProperties.VAT_RATE)
  double vatRate;

  @NonFinal
  @Value(AppProperties.SERVICE_FEE_RATE)
  double serviceFeeRate;

  @Transactional
  public BookingResponse create(BookingCreationRequest request) {
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
      throw new AppException(ErrorType.CHECK_IN_OUT_DATE_NOT_BLANK);
    }

    if (checkOutDate.isBefore(checkInDate) || checkOutDate.isEqual(checkInDate)) {
      throw new AppException(ErrorType.CHECK_IN_OUT_DATE_NOT_BLANK);
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

    // Step 3: Check room availability and calculate pricing
    List<RoomInventory> inventories = roomInventoryService.validateRoomAvailability(
        request.getRoomId(), checkInDate, checkOutDate, numberOfRooms);

    double originalPrice = roomInventoryService.calculateOriginalPrice(inventories, numberOfRooms);

    // Step 4: Validate and apply discount
    Discount appliedDiscount = discountService.validateDiscount(request.getDiscountCode(), originalPrice);
    double[] discountAmounts = discountService.calculateDiscountAmount(appliedDiscount, originalPrice);
    double discountAmount = discountAmounts[0];
    double finalPrice = discountAmounts[1];

    // Step 4: Create booking and update inventory in transaction
    Booking booking = mapper.toEntity(request);

    // Set the fields that were ignored in mapper
    booking.setUser(user);
    booking.setRoom(room);
    booking.setHotel(hotel);
    booking.setOriginalPrice(originalPrice);
    booking.setDiscountAmount(discountAmount);
    booking.setFinalPrice(finalPrice);
    booking.setAppliedDiscount(appliedDiscount);
    booking.setStatus(BookingStatusType.PENDING_PAYMENT.getValue());

    // Save booking first
    Booking savedBooking = bookingRepository.save(booking);

    // Update room inventory availability
    roomInventoryService.updateAvailabilityForBooking(
        request.getRoomId(), checkInDate, checkOutDate, numberOfRooms);

    // Update discount usage count if discount was applied
    discountService.updateDiscountUsage(appliedDiscount);

    // Step 5: Return booking response with payment URL placeholder
    return mapper.toBookingResponse(savedBooking, null);
  }

  public BookingPricePreviewResponse getPricePreview(BookingPricePreviewRequest request) {
    // Step 1: Validate and fetch room
    Room room = roomRepository.findById(request.getRoomId())
        .orElseThrow(() -> new AppException(ErrorType.ROOM_NOT_FOUND));

    // Step 2: Validate dates
    LocalDate startDate = request.getStartDate();
    LocalDate endDate = request.getEndDate();
    LocalDate today = LocalDate.now();

    if (startDate.isBefore(today)) {
      throw new AppException(ErrorType.CHECK_IN_OUT_DATE_NOT_BLANK);
    }

    if (endDate.isBefore(startDate) || endDate.isEqual(startDate)) {
      throw new AppException(ErrorType.CHECK_IN_OUT_DATE_NOT_BLANK);
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

    double subtotal = roomInventoryService.calculateOriginalPrice(inventories, numberOfRooms);

    // Step 5: Validate and apply discount
    Discount appliedDiscount = discountService.validateDiscount(request.getDiscountCode(), subtotal);
    double[] discountAmounts = discountService.calculateDiscountAmount(appliedDiscount, subtotal);
    double discountAmount = discountAmounts[0];
    double netPriceAfterDiscount = discountAmounts[1];

    // Step 6: Calculate tax and service fee
    double taxAmount = netPriceAfterDiscount * vatRate;
    double serviceFeeAmount = netPriceAfterDiscount * serviceFeeRate;
    double finalPrice = netPriceAfterDiscount + taxAmount + serviceFeeAmount;

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

    // Step 7: Build and return response
    return BookingPricePreviewResponse.builder()
        .originalPrice(subtotal)
        .discountAmount(discountAmount)
        .appliedDiscount(appliedDiscount != null ? discountMapper.toDiscountBriefResponse(appliedDiscount) : null)
        .netPriceAfterDiscount(netPriceAfterDiscount)
        .tax(tax)
        .serviceFee(serviceFee)
        .finalPrice(finalPrice)
        .build();
  }
}
