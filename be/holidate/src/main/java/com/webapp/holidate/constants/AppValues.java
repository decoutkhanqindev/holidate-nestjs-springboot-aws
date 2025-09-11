package com.webapp.holidate.constants;

public class AppValues {
  public static final String ADMIN_EMAIL = "${spring.admin.email}";
  public static final String ADMIN_PASSWORD = "${spring.admin.password}";
  public static final String ADMIN_FULL_NAME = "${spring.admin.fullname}";
  public static final String SECRET_KEY = "${spring.jwt.secret-key}";
  public static final String ISSUER = "${spring.jwt.issuer}";
  public static final String MAIL_HOST = "${spring.mail.host}";
  public static final String MAIL_PORT = "${spring.mail.port}";
  public static final String MAIL_USERNAME = "${spring.mail.username}";
  public static final String MAIL_PASSWORD = "${spring.mail.password}";
  public static final String EMAIL_VERIFICATION_URL = "${spring.email.verification.url}";
  public static final String EMAIL_VERIFICATION_EXPIRATION_HOURS = "${spring.email.verification.expiration-hours}";
}
