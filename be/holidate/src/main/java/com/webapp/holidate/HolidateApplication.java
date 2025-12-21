package com.webapp.holidate;

import com.webapp.holidate.constants.EnvVariables;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class HolidateApplication {
  public static void main(String[] args) {
    Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

    configureProperty(dotenv, EnvVariables.DB_URL);
    configureProperty(dotenv, EnvVariables.DB_USERNAME);
    configureProperty(dotenv, EnvVariables.DB_PASSWORD);
    configureProperty(dotenv, EnvVariables.AWS_S3_ACCESS_KEY);
    configureProperty(dotenv, EnvVariables.AWS_S3_SECRET_KEY);
    configureProperty(dotenv, EnvVariables.AWS_S3_BUCKET_NAME);
    configureProperty(dotenv, EnvVariables.AWS_S3_REGION);
    configureProperty(dotenv, EnvVariables.AWS_S3_BASE_URL);
    configureProperty(dotenv, EnvVariables.ADMIN_EMAIL);
    configureProperty(dotenv, EnvVariables.ADMIN_PASSWORD);
    configureProperty(dotenv, EnvVariables.ADMIN_FULLNAME);
    configureProperty(dotenv, EnvVariables.JWT_SECRET_KEY);
    configureProperty(dotenv, EnvVariables.JWT_ISSUER);
    configureProperty(dotenv, EnvVariables.JWT_ACCESS_TOKEN_EXPIRATION_MILLIS);
    configureProperty(dotenv, EnvVariables.JWT_REFRESH_TOKEN_EXPIRATION_MILLIS);
    configureProperty(dotenv, EnvVariables.JWT_TOKEN_COOKIE_NAME);
    configureProperty(dotenv, EnvVariables.MAIL_HOST);
    configureProperty(dotenv, EnvVariables.MAIL_PORT);
    configureProperty(dotenv, EnvVariables.MAIL_USERNAME);
    configureProperty(dotenv, EnvVariables.MAIL_PASSWORD);
    configureProperty(dotenv, EnvVariables.GOOGLE_CLIENT_ID);
    configureProperty(dotenv, EnvVariables.GOOGLE_CLIENT_SECRET);
    configureProperty(dotenv, EnvVariables.FRONTEND_URL);
    configureProperty(dotenv, EnvVariables.BACKEND_URL);
    configureProperty(dotenv, EnvVariables.OTP_EXPIRATION_MILLIS);
    configureProperty(dotenv, EnvVariables.OTP_MAX_ATTEMPTS);
    configureProperty(dotenv, EnvVariables.OTP_BLOCK_TIME_MILLIS);
    configureProperty(dotenv, EnvVariables.VAT_RATE);
    configureProperty(dotenv, EnvVariables.SERVICE_FEE_RATE);
    configureProperty(dotenv, EnvVariables.DYNAMIC_PRICING_LOOK_AHEAD_MILLIS);
    configureProperty(dotenv, EnvVariables.WEEKEND_PRICE_MULTIPLIER);
    configureProperty(dotenv, EnvVariables.VNPAY_TMN_CODE);
    configureProperty(dotenv, EnvVariables.VNPAY_HASH_SECRET);
    configureProperty(dotenv, EnvVariables.VNPAY_API_URL);
    configureProperty(dotenv, EnvVariables.VNPAY_REFUND_URL);

    SpringApplication.run(HolidateApplication.class, args);
  }

  private static void configureProperty(Dotenv dotenv, String key) {
    String value = dotenv.get(key);
    if (value == null) {
      value = System.getenv(key);
    }
    if (value != null) {
      System.setProperty(key, value);
    }
  }
}