package com.webapp.holidate.config.security;

import com.nimbusds.jose.JOSEException;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.exception.CustomAuthenticationException;
import com.webapp.holidate.service.auth.AuthService;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;

@Slf4j
@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CustomJwtDecoder implements JwtDecoder {
  AuthService authService;

  @NonFinal
  @Value(AppValues.SECRET_KEY)
  String SECRET_KEY;

  @Override
  public Jwt decode(String token) throws JwtException {
    try {
      authService.getSignedJWT(token);
    } catch (JOSEException | ParseException e) {
      throw new CustomAuthenticationException(ErrorType.INVALID_TOKEN);
    } catch (AppException e) {
      throw new CustomAuthenticationException(e.getError());
    }

    SecretKeySpec secretKeySpec = new SecretKeySpec(SECRET_KEY.getBytes(), MacAlgorithm.HS512.name());
    NimbusJwtDecoder nimbusJwtDecoder = NimbusJwtDecoder
      .withSecretKey(secretKeySpec)
      .macAlgorithm(MacAlgorithm.HS512)
      .build();

    return nimbusJwtDecoder.decode(token);
  }
}
