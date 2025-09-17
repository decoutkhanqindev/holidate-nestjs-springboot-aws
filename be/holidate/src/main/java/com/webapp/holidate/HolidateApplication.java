package com.webapp.holidate;

import com.webapp.holidate.constants.EnvVariables;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication
public class HolidateApplication {
  public static void main(String[] args) {
    Dotenv dotenv = Dotenv.load();

    System.setProperty(EnvVariables.DB_URL, dotenv.get(EnvVariables.DB_URL));
    System.setProperty(EnvVariables.DB_USERNAME, dotenv.get(EnvVariables.DB_USERNAME));
    System.setProperty(EnvVariables.DB_PASSWORD, dotenv.get(EnvVariables.DB_PASSWORD));
    System.setProperty(EnvVariables.ADMIN_EMAIL, dotenv.get(EnvVariables.ADMIN_EMAIL));
    System.setProperty(EnvVariables.ADMIN_PASSWORD, dotenv.get(EnvVariables.ADMIN_PASSWORD));
    System.setProperty(EnvVariables.ADMIN_FULLNAME, dotenv.get(EnvVariables.ADMIN_FULLNAME));
    System.setProperty(EnvVariables.SECRET_KEY, dotenv.get(EnvVariables.SECRET_KEY));
    System.setProperty(EnvVariables.ISSUER, dotenv.get(EnvVariables.ISSUER));
    System.setProperty(EnvVariables.ACCESS_TOKEN_EXPIRATION_MILLIS, dotenv.get(EnvVariables.ACCESS_TOKEN_EXPIRATION_MILLIS));
    System.setProperty(EnvVariables.REFRESH_TOKEN_EXPIRATION_MILLIS, dotenv.get(EnvVariables.REFRESH_TOKEN_EXPIRATION_MILLIS));
    System.setProperty(EnvVariables.ACCESS_TOKEN_COOKIE_NAME, dotenv.get(EnvVariables.ACCESS_TOKEN_COOKIE_NAME));
    System.setProperty(EnvVariables.REFRESH_TOKEN_COOKIE_NAME, dotenv.get(EnvVariables.REFRESH_TOKEN_COOKIE_NAME));
    System.setProperty(EnvVariables.ID_COOKIE_NAME, dotenv.get(EnvVariables.ID_COOKIE_NAME));
    System.setProperty(EnvVariables.MAIL_HOST, dotenv.get(EnvVariables.MAIL_HOST));
    System.setProperty(EnvVariables.MAIL_PORT, dotenv.get(EnvVariables.MAIL_PORT));
    System.setProperty(EnvVariables.MAIL_USERNAME, dotenv.get(EnvVariables.MAIL_USERNAME));
    System.setProperty(EnvVariables.MAIL_PASSWORD, dotenv.get(EnvVariables.MAIL_PASSWORD));
    System.setProperty(EnvVariables.GOOGLE_CLIENT_ID, dotenv.get(EnvVariables.GOOGLE_CLIENT_ID));
    System.setProperty(EnvVariables.GOOGLE_CLIENT_SECRET, dotenv.get(EnvVariables.GOOGLE_CLIENT_SECRET));
    System.setProperty(EnvVariables.FRONTEND_URL, dotenv.get(EnvVariables.FRONTEND_URL));
    System.setProperty(EnvVariables.FRONTEND_LOGIN_SUCCESS_URL, dotenv.get(EnvVariables.FRONTEND_LOGIN_SUCCESS_URL));
    System.setProperty(EnvVariables.FRONTEND_LOGIN_FAILURE_URL, dotenv.get(EnvVariables.FRONTEND_LOGIN_FAILURE_URL));
    System.setProperty(EnvVariables.OTP_EXPIRATION_MILLIS, dotenv.get(EnvVariables.OTP_EXPIRATION_MILLIS));
    System.setProperty(EnvVariables.OTP_MAX_ATTEMPTS, dotenv.get(EnvVariables.OTP_MAX_ATTEMPTS));
    System.setProperty(EnvVariables.OTP_BLOCK_TIME_MILLIS, dotenv.get(EnvVariables.OTP_BLOCK_TIME_MILLIS));

    SpringApplication.run(HolidateApplication.class, args);
  }
}