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
import org.springframework.stereotype.Service;

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

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PaymentService {
  PaymentRepository paymentRepository;
  BookingRepository bookingRepository;
  RoomInventoryService roomInventoryService;

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

  @Transactional
  public String handleVnPayCallback(Map<String, String> vnpayParams) {
    // Validate signature
    if (!validateSignature(vnpayParams)) {
      return frontendUrl + "/payment/failure?reason=invalid_signature";
    }

    // Get transaction reference (payment ID)
    String transactionRef = vnpayParams.get("vnp_TxnRef");
    if (transactionRef == null || transactionRef.isEmpty()) {
      return frontendUrl + "/payment/failure?reason=missing_transaction_ref";
    }

    // Find payment by ID
    Payment payment = paymentRepository.findById(transactionRef)
      .orElseThrow(() -> new AppException(ErrorType.BOOKING_NOT_FOUND));

    // Check if payment is already processed
    if (!PaymentStatusType.PENDING.getValue().equals(payment.getStatus())) {
      return frontendUrl + "/payment/failure?reason=payment_already_processed";
    }

    // Get response code
    String responseCode = vnpayParams.get("vnp_ResponseCode");
    String transactionId = vnpayParams.get("vnp_TransactionNo");

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
      // Payment failed
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

      return frontendUrl + "/payment/failure?reason=payment_failed&code=" + responseCode;
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
}
