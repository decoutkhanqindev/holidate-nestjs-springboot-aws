package com.webapp.holidate.controller.booking;

import com.webapp.holidate.constants.api.endpoint.BookingEndpoints;
import com.webapp.holidate.service.booking.PaymentService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping(BookingEndpoints.PAYMENT)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PaymentController {
  PaymentService service;

  @GetMapping(BookingEndpoints.CALLBACK)
  public ResponseEntity<String> handleVnPayCallback(
      @RequestParam Map<String, String> vnpayParams,
      HttpServletRequest request) {

    String redirectUrl = service.handleVnPayCallback(vnpayParams);
    return ResponseEntity.status(HttpStatus.FOUND)
        .header("Location", redirectUrl)
        .build();
  }
}
