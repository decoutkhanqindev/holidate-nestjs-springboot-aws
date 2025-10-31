package com.webapp.holidate.service.booking;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.entity.booking.Booking;
import com.webapp.holidate.entity.booking.Payment;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.booking.BookingRepository;
import com.webapp.holidate.repository.booking.PaymentRepository;
import com.webapp.holidate.service.accommodation.room.RoomInventoryService;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.booking.BookingStatusType;
import com.webapp.holidate.type.booking.PaymentStatusType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;

@Slf4j
@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {
  PaymentRepository paymentRepository;
  BookingRepository bookingRepository;
  RoomInventoryService roomInventoryService;
  BookingService bookingService;

  public PaymentService(PaymentRepository paymentRepository,
      BookingRepository bookingRepository,
      RoomInventoryService roomInventoryService,
      @Lazy BookingService bookingService) {
    this.paymentRepository = paymentRepository;
    this.bookingRepository = bookingRepository;
    this.roomInventoryService = roomInventoryService;
    this.bookingService = bookingService;
  }

  @NonFinal
  @Value(AppProperties.VNPAY_TMN_CODE)
  String vnpayTmnCode;

  @NonFinal
  @Value(AppProperties.VNPAY_HASH_SECRET)
  String vnpayHashSecret;

  @NonFinal
  @Value(AppProperties.VNPAY_API_URL)
  String vnpayApiUrl;

  @NonFinal
  @Value(AppProperties.VNPAY_REFUND_URL)
  String vnpayRefundUrl;

  @NonFinal
  @Value(AppProperties.FRONTEND_URL)
  String frontendUrl;

  @NonFinal
  @Value(AppProperties.BACKEND_URL)
  String backendUrl;

  public String createPaymentUrl(Booking booking, HttpServletRequest request) {
    // Create payment entity
    Payment payment = Payment.builder()
        .booking(booking)
        .amount(booking.getFinalPrice())
        .paymentMethod("vnpay")
        .status(PaymentStatusType.PENDING.getValue())
        .build();

    Payment savedPayment = paymentRepository.save(payment);

    // Get client IP address
    String ipAddress = getIpAddress(request);

    // Create VNPay parameters
    Map<String, String> vnpParams = new TreeMap<>();
    vnpParams.put("vnp_Version", "2.1.0");
    vnpParams.put("vnp_Command", "pay");
    vnpParams.put("vnp_TmnCode", vnpayTmnCode);
    vnpParams.put("vnp_Amount", String.valueOf((long) (booking.getFinalPrice() * 100))); // Convert to cents
    vnpParams.put("vnp_CurrCode", "VND");
    vnpParams.put("vnp_TxnRef", savedPayment.getId());
    vnpParams.put("vnp_OrderInfo", "Payment for booking: " + booking.getId());
    vnpParams.put("vnp_OrderType", "other");
    vnpParams.put("vnp_Locale", "vn");
    vnpParams.put("vnp_ReturnUrl", backendUrl + "/payment/callback");
    vnpParams.put("vnp_IpAddr", ipAddress);
    vnpParams.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
    vnpParams.put("vnp_ExpireDate",
        LocalDateTime.now().plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

    // Build query string with URL encoding
    StringBuilder queryString = new StringBuilder();
    for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
      if (entry.getValue() != null && !entry.getValue().isEmpty()) {
        queryString.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
        queryString.append("=");
        queryString.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        queryString.append("&");
      }
    }

    // Remove last '&'
    String query = queryString.toString();
    if (query.endsWith("&")) {
      query = query.substring(0, query.length() - 1);
    }

    // Generate secure hash using the same method as validation
    String secureHash = hmacSHA512(vnpayHashSecret, query);

    // Build final URL
    return vnpayApiUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
  }

  public String createPaymentUrlForAmount(Booking booking, double amount, HttpServletRequest request,
      String paymentId) {
    // Get client IP address
    String ipAddress = getIpAddress(request);

    // Create VNPay parameters
    Map<String, String> vnpParams = new TreeMap<>();
    vnpParams.put("vnp_Version", "2.1.0");
    vnpParams.put("vnp_Command", "pay");
    vnpParams.put("vnp_TmnCode", vnpayTmnCode);
    vnpParams.put("vnp_Amount", String.valueOf((long) (amount * 100))); // Convert to cents
    vnpParams.put("vnp_CurrCode", "VND");
    vnpParams.put("vnp_TxnRef", paymentId);
    vnpParams.put("vnp_OrderInfo", "Payment for reschedule booking: " + booking.getId());
    vnpParams.put("vnp_OrderType", "other");
    vnpParams.put("vnp_Locale", "vn");
    vnpParams.put("vnp_ReturnUrl", backendUrl + "/payment/callback");
    vnpParams.put("vnp_IpAddr", ipAddress);
    vnpParams.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
    vnpParams.put("vnp_ExpireDate",
        LocalDateTime.now().plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

    // Build query string with URL encoding
    StringBuilder queryString = new StringBuilder();
    for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
      if (entry.getValue() != null && !entry.getValue().isEmpty()) {
        queryString.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
        queryString.append("=");
        queryString.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        queryString.append("&");
      }
    }

    // Remove last '&'
    String query = queryString.toString();
    if (query.endsWith("&")) {
      query = query.substring(0, query.length() - 1);
    }

    // Generate secure hash using the same method as validation
    String secureHash = hmacSHA512(vnpayHashSecret, query);

    // Build final URL
    return vnpayApiUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
  }

  public String createPaymentUrlForReschedule(Booking booking, double amount, HttpServletRequest request,
      String tempPaymentId, java.time.LocalDate newCheckInDate, java.time.LocalDate newCheckOutDate,
      double newFinalPrice, double rescheduleFee, double newOriginalPrice, double discountAmount) {
    // Get client IP address
    String ipAddress = getIpAddress(request);

    // Encode reschedule information in orderInfo
    // Format:
    // "RESCHEDULE:{bookingId}:{newCheckInDate}:{newCheckOutDate}:{newFinalPrice}:{rescheduleFee}:{newOriginalPrice}:{discountAmount}"
    String orderInfo = String.format("RESCHEDULE:%s:%s:%s:%.2f:%.2f:%.2f:%.2f",
        booking.getId(),
        newCheckInDate.toString(),
        newCheckOutDate.toString(),
        newFinalPrice,
        rescheduleFee,
        newOriginalPrice,
        discountAmount);

    // Create VNPay parameters
    Map<String, String> vnpParams = new TreeMap<>();
    vnpParams.put("vnp_Version", "2.1.0");
    vnpParams.put("vnp_Command", "pay");
    vnpParams.put("vnp_TmnCode", vnpayTmnCode);
    vnpParams.put("vnp_Amount", String.valueOf((long) (amount * 100))); // Convert to cents
    vnpParams.put("vnp_CurrCode", "VND");
    vnpParams.put("vnp_TxnRef", tempPaymentId);
    vnpParams.put("vnp_OrderInfo", orderInfo);
    vnpParams.put("vnp_OrderType", "other");
    vnpParams.put("vnp_Locale", "vn");
    vnpParams.put("vnp_ReturnUrl", backendUrl + "/payment/callback");
    vnpParams.put("vnp_IpAddr", ipAddress);
    vnpParams.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
    vnpParams.put("vnp_ExpireDate",
        LocalDateTime.now().plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

    // Build query string with URL encoding
    StringBuilder queryString = new StringBuilder();
    for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
      if (entry.getValue() != null && !entry.getValue().isEmpty()) {
        queryString.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
        queryString.append("=");
        queryString.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        queryString.append("&");
      }
    }

    // Remove last '&'
    String query = queryString.toString();
    if (query.endsWith("&")) {
      query = query.substring(0, query.length() - 1);
    }

    // Generate secure hash using the same method as validation
    String secureHash = hmacSHA512(vnpayHashSecret, query);

    // Build final URL
    return vnpayApiUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
  }

  // VNPay Refund API integration
  // NOTE: VNPay Sandbox environment may not support refund functionality.
  // In sandbox mode, this method will skip the actual refund API call and log the
  // action.
  // In production, it will call the actual VNPay refund API.
  public void refundPayment(Payment payment, double refundAmount) {
    if (payment == null) {
      throw new AppException(ErrorType.BOOKING_NOT_FOUND);
    }
    if (refundAmount < 0) {
      throw new AppException(ErrorType.UNKNOWN_ERROR);
    }

    // Validate transactionId from VNPay exists (required for refund)
    if (payment.getTransactionId() == null || payment.getTransactionId().isEmpty()) {
      throw new AppException(ErrorType.VNPAY_TRANSACTION_NOT_FOUND);
    }

    // Check if using sandbox environment (VNPay sandbox may not support refund)
    boolean isSandbox = vnpayRefundUrl != null && vnpayRefundUrl.contains("sandbox");

    if (isSandbox) {
      // In sandbox mode, skip actual refund call and log the action
      // This allows testing the cancellation flow without actual refund processing
      log.warn("Sandbox Mode: Skipping VNPay refund API call. Refund would be processed in production. " +
          "Payment ID: {}, Transaction ID: {}, Refund Amount: {}",
          payment.getId(), payment.getTransactionId(), refundAmount);
      // Continue execution - refund is considered successful in sandbox for testing
      return;
    }

    // Production mode: Call actual VNPay Refund API
    // VNPay requires amount in smallest currency unit (x100)
    long amountInCents = (long) Math.round(refundAmount * 100);

    // Build refund params
    Map<String, String> params = new TreeMap<>();
    params.put("vnp_RequestId", String.valueOf(System.currentTimeMillis()));
    params.put("vnp_Version", "2.1.0");
    params.put("vnp_Command", "refund");
    params.put("vnp_TmnCode", vnpayTmnCode);
    // 02 = Full refund, 03 = Partial refund. Choose 03 if refundAmount <
    // payment.amount
    String transactionType = (refundAmount < payment.getAmount()) ? "03" : "02";
    params.put("vnp_TransactionType", transactionType);
    // Use vnp_TxnRef is payment.id sent when create payment
    params.put("vnp_TxnRef", payment.getId());
    // Use vnp_TransactionNo is transaction ID from VNPay (required for refund)
    params.put("vnp_TransactionNo", payment.getTransactionId());
    params.put("vnp_Amount", String.valueOf(amountInCents));
    params.put("vnp_CurrCode", "VND");
    params.put("vnp_OrderInfo", "Refund for booking: " + payment.getBooking().getId());
    // Original transaction date from VNPay (use completedAt if available, otherwise
    // createdAt)
    LocalDateTime transactionDate = payment.getCompletedAt() != null ? payment.getCompletedAt()
        : payment.getCreatedAt();
    String originalTransDate = transactionDate.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    params.put("vnp_TransactionDate", originalTransDate);
    params.put("vnp_IpAddr", "127.0.0.1");
    params.put("vnp_CreateBy", "system");
    params.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

    // Create secure hash
    String hashData = buildHashDataForValidation(params);
    String secureHash = hmacSHA512(vnpayHashSecret, hashData);
    params.put("vnp_SecureHash", secureHash);

    // Call VNPay Refund API
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<Map<String, String>> request = new HttpEntity<>(params, headers);

    @SuppressWarnings("unchecked")
    Map<String, Object> response = restTemplate.postForObject(vnpayRefundUrl, request, Map.class);
    if (response == null) {
      throw new AppException(ErrorType.PAYMENT_RESPONSE_INVALID);
    }

    // According to documentation, code "00" is success
    Object responseCodeObj = response.get("vnp_ResponseCode");
    String responseCode = responseCodeObj != null ? responseCodeObj.toString() : null;
    if (responseCode == null || responseCode.isEmpty()) {
      throw new AppException(ErrorType.PAYMENT_RESPONSE_INVALID);
    }

    if (!"00".equals(responseCode)) {
      ErrorType errorType = mapVnPayResponseCodeToErrorType(responseCode);
      throw new AppException(errorType);
    }
  }

  @Transactional
  public String handleVnPayCallback(Map<String, String> vnpayParams) {
    // Validate signature
    if (!validateSignature(vnpayParams)) {
      return frontendUrl + "/payment/failure?reason=invalid_signature";
    }

    // Get transaction reference (payment ID) and order info
    String transactionRef = vnpayParams.get("vnp_TxnRef");
    String orderInfo = vnpayParams.get("vnp_OrderInfo");
    if (transactionRef == null || transactionRef.isEmpty()) {
      return frontendUrl + "/payment/failure?reason=missing_transaction_ref";
    }

    // Check if this is a reschedule payment
    if (orderInfo != null && orderInfo.startsWith("RESCHEDULE:")) {
      // Handle reschedule payment callback
      return handleReschedulePaymentCallback(vnpayParams, orderInfo, transactionRef);
    }

    // Regular payment flow - find payment by ID
    Payment payment = paymentRepository.findById(transactionRef)
        .orElseThrow(() -> new AppException(ErrorType.BOOKING_NOT_FOUND));

    // Check if payment is already processed
    if (!PaymentStatusType.PENDING.getValue().equals(payment.getStatus())) {
      return frontendUrl + "/payment/failure?reason=payment_already_processed";
    }

    // Get response code
    String responseCode = vnpayParams.get("vnp_ResponseCode");
    String transactionId = vnpayParams.get("vnp_TransactionNo");

    // Validate response code
    if (responseCode == null || responseCode.isEmpty()) {
      // Invalid response - treat as payment failed
      ErrorType errorType = ErrorType.PAYMENT_RESPONSE_INVALID;

      payment.setStatus(PaymentStatusType.FAILED.getValue());
      payment.setTransactionId(transactionId);
      payment.setCompletedAt(LocalDateTime.now());

      // Update booking status
      Booking booking = payment.getBooking();
      booking.setStatus(BookingStatusType.CANCELLED.getValue());
      booking.setUpdatedAt(LocalDateTime.now());

      // Release room inventory
      roomInventoryService.updateAvailabilityForCancellation(
          booking.getRoom().getId(),
          booking.getCheckInDate(),
          booking.getCheckOutDate(),
          booking.getNumberOfRooms());

      bookingRepository.save(booking);
      paymentRepository.save(payment);

      return frontendUrl + "/payment/failure?reason=invalid_response&errorType=" + errorType.name();
    }

    if ("00".equals(responseCode)) {
      // Payment successful
      payment.setStatus(PaymentStatusType.SUCCESS.getValue());
      payment.setTransactionId(transactionId);
      payment.setCompletedAt(LocalDateTime.now());

      // Update booking status
      Booking booking = payment.getBooking();
      booking.setStatus(BookingStatusType.CONFIRMED.getValue());
      booking.setUpdatedAt(LocalDateTime.now());

      bookingRepository.save(booking);
      paymentRepository.save(payment);

      return frontendUrl + "/payment/success?bookingId=" + booking.getId();
    } else {
      // Payment failed - get specific error type
      ErrorType errorType = mapVnPayResponseCodeToErrorType(responseCode);

      payment.setStatus(PaymentStatusType.FAILED.getValue());
      payment.setTransactionId(transactionId);
      payment.setCompletedAt(LocalDateTime.now());

      // Update booking status
      Booking booking = payment.getBooking();
      booking.setStatus(BookingStatusType.CANCELLED.getValue());
      booking.setUpdatedAt(LocalDateTime.now());

      // IMPORTANT: Release room inventory when payment fails
      // This reverses the room hold from the booking creation process
      roomInventoryService.updateAvailabilityForCancellation(
          booking.getRoom().getId(),
          booking.getCheckInDate(),
          booking.getCheckOutDate(),
          booking.getNumberOfRooms());

      bookingRepository.save(booking);
      paymentRepository.save(payment);

      // Include error code and type in redirect URL for frontend handling
      String errorTypeParam = errorType != null ? errorType.name() : ErrorType.PAYMENT_RESPONSE_INVALID.name();
      return frontendUrl + "/payment/failure?reason=payment_failed&code=" + responseCode + "&errorType="
          + errorTypeParam;
    }
  }

  public boolean validateSignature(Map<String, String> vnpayParams) {
    String receivedHash = vnpayParams.get("vnp_SecureHash");
    if (receivedHash == null || receivedHash.isEmpty()) {
      return false;
    }

    // Remove signature from params for validation
    Map<String, String> paramsForValidation = new TreeMap<>(vnpayParams);
    paramsForValidation.remove("vnp_SecureHash");
    paramsForValidation.remove("vnp_SecureHashType");

    // Build hash data - VNPay requires specific parameter order
    String hashData = buildHashDataForValidation(paramsForValidation);

    // Generate hash
    String generatedHash = hmacSHA512(vnpayHashSecret, hashData);

    return receivedHash.equals(generatedHash);
  }

  private String buildHashDataForValidation(Map<String, String> params) {
    // VNPay requires specific parameter order for signature validation
    // Based on VNPay documentation, parameters should be sorted alphabetically
    // and concatenated with '&' separator
    // IMPORTANT: VNPay requires URL encoding for hash calculation

    StringBuilder hashData = new StringBuilder();

    // Sort parameters by key (TreeMap already does this)
    for (Map.Entry<String, String> entry : params.entrySet()) {
      if (entry.getValue() != null && !entry.getValue().isEmpty()) {
        // VNPay requires URL encoding for hash calculation
        String encodedKey = URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8);
        String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8);
        hashData.append(encodedKey).append("=").append(encodedValue).append("&");
      }
    }

    // Remove last '&'
    String result = hashData.toString();
    if (result.endsWith("&")) {
      result = result.substring(0, result.length() - 1);
    }

    return result;
  }

  private String hmacSHA512(final String key, final String data) {
    try {
      Mac mac = Mac.getInstance("HmacSHA512");
      SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
      mac.init(secretKeySpec);

      byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

      StringBuilder hexString = new StringBuilder();
      for (byte b : hashBytes) {
        String hex = Integer.toHexString(0xff & b);
        if (hex.length() == 1) {
          hexString.append('0');
        }
        hexString.append(hex);
      }

      return hexString.toString();
    } catch (NoSuchAlgorithmException | InvalidKeyException e) {
      throw new AppException(ErrorType.PAYMENT_SIGNATURE_INVALID);
    }
  }

  private String getIpAddress(HttpServletRequest request) {
    String xForwardedFor = request.getHeader("X-Forwarded-For");
    if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
      return xForwardedFor.split(",")[0].trim();
    }

    String xRealIp = request.getHeader("X-Real-IP");
    if (xRealIp != null && !xRealIp.isEmpty()) {
      return xRealIp;
    }

    return request.getRemoteAddr();
  }

  private ErrorType mapVnPayResponseCodeToErrorType(String responseCode) {
    return switch (responseCode) {
      case "00" -> null; // Success - should not reach here
      case "07" -> ErrorType.VNPAY_TRANSACTION_SUSPICIOUS;
      case "09" -> ErrorType.VNPAY_ACCOUNT_NOT_REGISTERED;
      case "10" -> ErrorType.VNPAY_VERIFICATION_FAILED;
      case "11" -> ErrorType.VNPAY_PAYMENT_EXPIRED;
      case "12" -> ErrorType.VNPAY_ACCOUNT_LOCKED;
      case "13" -> ErrorType.VNPAY_OTP_INCORRECT;
      case "24" -> ErrorType.VNPAY_TRANSACTION_CANCELLED;
      case "51" -> ErrorType.VNPAY_INSUFFICIENT_BALANCE;
      case "65" -> ErrorType.VNPAY_TRANSACTION_LIMIT_EXCEEDED;
      case "75" -> ErrorType.VNPAY_BANK_MAINTENANCE;
      case "79" -> ErrorType.VNPAY_PAYMENT_PASSWORD_INCORRECT;
      default -> {
        // For refund specific errors or unknown codes
        if (responseCode.startsWith("91") || responseCode.startsWith("94")) {
          yield ErrorType.VNPAY_TRANSACTION_NOT_FOUND;
        } else if (responseCode.startsWith("94")) {
          yield ErrorType.VNPAY_DUPLICATE_TRANSACTION;
        } else if (responseCode.startsWith("95") || responseCode.startsWith("96")) {
          yield ErrorType.VNPAY_TRANSACTION_ALREADY_PROCESSED;
        } else if (responseCode.startsWith("97")) {
          yield ErrorType.VNPAY_INVALID_TRANSACTION;
        } else if (responseCode.startsWith("99")) {
          yield ErrorType.VNPAY_REFUND_NOT_ALLOWED;
        }
        yield ErrorType.PAYMENT_RESPONSE_INVALID; // Default fallback
      }
    };
  }

  @Transactional
  private String handleReschedulePaymentCallback(Map<String, String> vnpayParams, String orderInfo,
      String transactionRef) {
    // Parse orderInfo:
    // "RESCHEDULE:{bookingId}:{newCheckInDate}:{newCheckOutDate}:{newFinalPrice}:{rescheduleFee}:{newOriginalPrice}:{discountAmount}"
    String[] parts = orderInfo.split(":");
    if (parts.length < 8) {
      return frontendUrl + "/payment/failure?reason=invalid_reschedule_info";
    }

    String bookingId = parts[1];
    java.time.LocalDate newCheckInDate = java.time.LocalDate.parse(parts[2]);
    java.time.LocalDate newCheckOutDate = java.time.LocalDate.parse(parts[3]);
    double newFinalPrice = Double.parseDouble(parts[4]);
    double rescheduleFee = Double.parseDouble(parts[5]);
    double newOriginalPrice = Double.parseDouble(parts[6]);
    double discountAmount = Double.parseDouble(parts[7]);

    // Get response code
    String responseCode = vnpayParams.get("vnp_ResponseCode");
    String transactionId = vnpayParams.get("vnp_TransactionNo");

    // Validate response code
    if (responseCode == null || responseCode.isEmpty()) {
      return frontendUrl + "/payment/failure?reason=invalid_response";
    }

    if (!"00".equals(responseCode)) {
      // Payment failed - don't process reschedule
      ErrorType errorType = mapVnPayResponseCodeToErrorType(responseCode);
      String errorTypeParam = errorType != null ? errorType.name() : ErrorType.PAYMENT_RESPONSE_INVALID.name();
      return frontendUrl + "/payment/failure?reason=payment_failed&code=" + responseCode + "&errorType="
          + errorTypeParam;
    }

    // Payment successful - complete reschedule
    try {
      bookingService.completeRescheduleAfterPayment(bookingId, newCheckInDate, newCheckOutDate, newFinalPrice,
          rescheduleFee, newOriginalPrice, discountAmount, transactionRef, transactionId);
      return frontendUrl + "/payment/success?bookingId=" + bookingId + "&type=reschedule";
    } catch (Exception e) {
      log.error("Failed to complete reschedule after payment for booking: {}", bookingId, e);
      return frontendUrl + "/payment/failure?reason=reschedule_failed";
    }
  }
}
