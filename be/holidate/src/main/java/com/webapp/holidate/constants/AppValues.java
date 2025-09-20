package com.webapp.holidate.constants;

public class AppValues {
  public static final String ADMIN_EMAIL = "${spring.admin.email}";
  public static final String ADMIN_PASSWORD = "${spring.admin.password}";
  public static final String ADMIN_FULL_NAME = "${spring.admin.fullname}";
  public static final String AWS_S3_ACCESS_KEY = "${spring.aws.s3.access-key}";
  public static final String AWS_S3_SECRET_KEY = "${spring.aws.s3.secret-key}";
  public static final String AWS_S3_BUCKET_NAME = "${spring.aws.s3.bucket-name}";
  public static final String AWS_S3_REGION = "${spring.aws.s3.region}";
  public static final String AWS_S3_BASE_URL = "${spring.aws.s3.base-url}";
  public static final String JWT_SECRET_KEY = "${spring.jwt.secret-key}";
  public static final String JWT_ISSUER = "${spring.jwt.issuer}";
  public static final String JWT_ACCESS_TOKEN_EXPIRATION_MILLIS = "${spring.jwt.access-token.expiration-millis}";
  public static final String JWT_REFRESH_TOKEN_EXPIRATION_MILLIS = "${spring.jwt.refresh-token.expiration-millis}";
  public static final String JWT_TOKEN_COOKIE_NAME = "${spring.jwt.token.cookie-name}";
  public static final String FRONTEND_URL = "${spring.security.oauth2.client.frontend-url}";
  public static final String FRONTEND_LOGIN_SUCCESS_URL = "${spring.security.oauth2.client.frontend-login-success-url}";
  public static final String FRONTEND_LOGIN_FAILURE_URL = "${spring.security.oauth2.client.frontend-login-failure-url}";
  public static final String OTP_EXPIRATION_MILLIS = "${spring.otp.verification.expiration-millis}";
  public static final String OTP_MAX_ATTEMPTS = "${spring.otp.verification.max-attempts}";
  public static final String OTP_BLOCK_TIME_MILLIS = "${spring.otp.verification.block-time-millis}";
}
