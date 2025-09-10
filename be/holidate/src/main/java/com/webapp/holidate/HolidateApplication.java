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
    System.setProperty(EnvVariables.MAIL_HOST, dotenv.get(EnvVariables.MAIL_HOST));
    System.setProperty(EnvVariables.MAIL_PORT, dotenv.get(EnvVariables.MAIL_PORT));
    System.setProperty(EnvVariables.MAIL_USERNAME, dotenv.get(EnvVariables.MAIL_USERNAME));
    System.setProperty(EnvVariables.MAIL_PASSWORD, dotenv.get(EnvVariables.MAIL_PASSWORD));
    System.setProperty(EnvVariables.EMAIL_VERIFICATION_URL, dotenv.get(EnvVariables.EMAIL_VERIFICATION_URL));
    System.setProperty(EnvVariables.EMAIL_VERIFICATION_EXPIRATION_HOURS, dotenv.get(EnvVariables.EMAIL_VERIFICATION_EXPIRATION_HOURS));

    SpringApplication.run(HolidateApplication.class, args);
  }
}
