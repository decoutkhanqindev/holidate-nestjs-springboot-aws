package com.webapp.holidate.constants;

public class AppValues {
  public static final String ADMIN_EMAIL = "${spring.admin.email}";
  public static final String ADMIN_PASSWORD = "${spring.admin.password}";
  public static final String ADMIN_FULL_NAME = "${spring.admin.fullname}";
  public static final String SECRET_KEY = "${spring.jwt.secret-key}";
  public static final String ISSUER = "${spring.jwt.issuer}";
  public static final String ACCESS_TOKEN_EXPIRATION_MILLIS = "${spring.jwt.access-token.expiration-millis}";
  public static final String REFRESH_TOKEN_EXPIRATION_MILLIS = "${spring.jwt.refresh-token.expiration-millis}";
  public static final String ACCESS_TOKEN_COOKIE_NAME = "${spring.jwt.access-token.cookie-name}";
  public static final String REFRESH_TOKEN_COOKIE_NAME = "${spring.jwt.refresh-token.cookie-name}";
  public static final String FRONTEND_URL = "${spring.security.oauth2.client.frontend-url}";
  public static final String FRONTEND_LOGIN_SUCCESS_URL = "${spring.security.oauth2.client.frontend-login-success-url}";
  public static final String FRONTEND_LOGIN_FAILURE_URL = "${spring.security.oauth2.client.frontend-login-failure-url}";
  public static final String OTP_EXPIRATION_MILLIS = "${spring.otp.verification.expiration-millis}";
  public static final String OTP_MAX_ATTEMPTS = "${spring.otp.verification.max-attempts}";
  public static final String OTP_BLOCK_TIME_MILLIS = "${spring.otp.verification.block-time-millis}";
}
