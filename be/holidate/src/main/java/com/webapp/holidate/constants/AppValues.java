package com.webapp.holidate.constants;

public class AppValues {
  public static final String ADMIN_EMAIL = "${spring.admin.email}";
  public static final String ADMIN_PASSWORD = "${spring.admin.password}";
  public static final String ADMIN_FULL_NAME = "${spring.admin.fullname}";
  public static final String SECRET_KEY = "${spring.jwt.secret-key}";
  public static final String ISSUER = "${spring.jwt.issuer}";
  public static final String ACCESS_TOKEN_EXPIRATION_MINUTES = "${spring.jwt.access-token.expiration-minutes}";
  public static final String REFRESH_TOKEN_EXPIRATION_DAYS = "${spring.jwt.refresh-token.expiration-days}";
  public static final String MAIL_HOST = "${spring.mail.host}";
  public static final String MAIL_PORT = "${spring.mail.port}";
  public static final String MAIL_USERNAME = "${spring.mail.username}";
  public static final String MAIL_PASSWORD = "${spring.mail.password}";
  public static final String OTP_EXPIRATION_MINUTES = "${spring.otp.verification.expiration-minutes}";
  public static final String OTP_MAX_ATTEMPTS = "${spring.otp.verification.max-attempts}";
  public static final String OTP_BLOCK_TIME_MINUTES = "${spring.otp.verification.block-time-minutes}";
}
