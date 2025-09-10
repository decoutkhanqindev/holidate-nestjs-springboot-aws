package com.webapp.holidate.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.repository.UserAuthInfoRepository;
import com.webapp.holidate.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;


@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthService {
  UserRepository userRepository;
  UserAuthInfoRepository authInfoRepository;

  @Value(AppValues.SECRET_KEY)
  String SECRET_KEY;

  @Value(AppValues.ISSUER)
  String ISSUER;

  public  String generateToken(User user) throws JOSEException {
    Date now = new Date();
    Date exp = new Date(Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli());

    JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
    JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
      .jwtID(user.getId())
      .subject(user.getEmail())
      .subject(user.getFullName())
      .claim("scope", user.getRole())
      .issuer(ISSUER)
      .issueTime(now)
      .expirationTime(exp)
      .build();
    Payload payload = new Payload(claimsSet.toJSONObject());
    JWSObject jwsObject = new JWSObject(jwsHeader, payload);

    MACSigner signer = new MACSigner(SECRET_KEY);
    jwsObject.sign(signer);
    return jwsObject.serialize();
  }
}
