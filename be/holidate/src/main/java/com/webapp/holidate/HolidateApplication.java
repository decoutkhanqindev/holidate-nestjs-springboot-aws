package com.webapp.holidate;

import com.webapp.holidate.constants.EnvVariables;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HolidateApplication {
  public static void main(String[] args) {
    Dotenv dotenv = Dotenv.load();

    System.setProperty(EnvVariables.DB_URL, dotenv.get(EnvVariables.DB_URL));
    System.setProperty(EnvVariables.DB_USERNAME, dotenv.get(EnvVariables.DB_USERNAME));
    System.setProperty(EnvVariables.DB_PASSWORD, dotenv.get(EnvVariables.DB_PASSWORD));
    System.setProperty(EnvVariables.AWS_S3_ACCESS_KEY, dotenv.get(EnvVariables.AWS_S3_ACCESS_KEY));
    System.setProperty(EnvVariables.AWS_S3_SECRET_KEY, dotenv.get(EnvVariables.AWS_S3_SECRET_KEY));
    System.setProperty(EnvVariables.AWS_S3_BUCKET_NAME, dotenv.get(EnvVariables.AWS_S3_BUCKET_NAME));
    System.setProperty(EnvVariables.AWS_S3_REGION, dotenv.get(EnvVariables.AWS_S3_REGION));
    System.setProperty(EnvVariables.AWS_S3_BASE_URL, dotenv.get(EnvVariables.AWS_S3_BASE_URL));
    System.setProperty(EnvVariables.ADMIN_EMAIL, dotenv.get(EnvVariables.ADMIN_EMAIL));
    System.setProperty(EnvVariables.ADMIN_PASSWORD, dotenv.get(EnvVariables.ADMIN_PASSWORD));
    System.setProperty(EnvVariables.ADMIN_FULLNAME, dotenv.get(EnvVariables.ADMIN_FULLNAME));
    System.setProperty(EnvVariables.JWT_SECRET_KEY, dotenv.get(EnvVariables.JWT_SECRET_KEY));
    System.setProperty(EnvVariables.JWT_ISSUER, dotenv.get(EnvVariables.JWT_ISSUER));
    System.setProperty(EnvVariables.JWT_ACCESS_TOKEN_EXPIRATION_MILLIS,
      dotenv.get(EnvVariables.JWT_ACCESS_TOKEN_EXPIRATION_MILLIS));
    System.setProperty(EnvVariables.JWT_REFRESH_TOKEN_EXPIRATION_MILLIS,
      dotenv.get(EnvVariables.JWT_REFRESH_TOKEN_EXPIRATION_MILLIS));
    System.setProperty(EnvVariables.JWT_TOKEN_COOKIE_NAME, dotenv.get(EnvVariables.JWT_TOKEN_COOKIE_NAME));
    System.setProperty(EnvVariables.MAIL_HOST, dotenv.get(EnvVariables.MAIL_HOST));
    System.setProperty(EnvVariables.MAIL_PORT, dotenv.get(EnvVariables.MAIL_PORT));
    System.setProperty(EnvVariables.MAIL_USERNAME, dotenv.get(EnvVariables.MAIL_USERNAME));
    System.setProperty(EnvVariables.MAIL_PASSWORD, dotenv.get(EnvVariables.MAIL_PASSWORD));
    System.setProperty(EnvVariables.GOOGLE_CLIENT_ID, dotenv.get(EnvVariables.GOOGLE_CLIENT_ID));
    System.setProperty(EnvVariables.GOOGLE_CLIENT_SECRET, dotenv.get(EnvVariables.GOOGLE_CLIENT_SECRET));
    System.setProperty(EnvVariables.FRONTEND_URL, dotenv.get(EnvVariables.FRONTEND_URL));
    System.setProperty(EnvVariables.BACKEND_URL, dotenv.get(EnvVariables.BACKEND_URL));
    System.setProperty(EnvVariables.OTP_EXPIRATION_MILLIS, dotenv.get(EnvVariables.OTP_EXPIRATION_MILLIS));
    System.setProperty(EnvVariables.OTP_MAX_ATTEMPTS, dotenv.get(EnvVariables.OTP_MAX_ATTEMPTS));
    System.setProperty(EnvVariables.OTP_BLOCK_TIME_MILLIS, dotenv.get(EnvVariables.OTP_BLOCK_TIME_MILLIS));
    System.setProperty(EnvVariables.VAT_RATE, dotenv.get(EnvVariables.VAT_RATE));
    System.setProperty(EnvVariables.SERVICE_FEE_RATE, dotenv.get(EnvVariables.SERVICE_FEE_RATE));
    System.setProperty(EnvVariables.DYNAMIC_PRICING_LOOK_AHEAD_MILLIS,
      dotenv.get(EnvVariables.DYNAMIC_PRICING_LOOK_AHEAD_MILLIS));
    System.setProperty(EnvVariables.WEEKEND_PRICE_MULTIPLIER, dotenv.get(EnvVariables.WEEKEND_PRICE_MULTIPLIER));
    System.setProperty(EnvVariables.VNPAY_TMN_CODE, dotenv.get(EnvVariables.VNPAY_TMN_CODE));
    System.setProperty(EnvVariables.VNPAY_HASH_SECRET, dotenv.get(EnvVariables.VNPAY_HASH_SECRET));
    System.setProperty(EnvVariables.VNPAY_API_URL, dotenv.get(EnvVariables.VNPAY_API_URL));

    SpringApplication.run(HolidateApplication.class, args);
  }
}