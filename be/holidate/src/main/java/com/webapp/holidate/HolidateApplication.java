package com.webapp.holidate;

import com.webapp.holidate.constants.EnvVariables;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HolidateApplication {
	public static void main(String[] args) {
    Dotenv dotenv = Dotenv.load();
    System.setProperty(EnvVariables.APP_NAME, dotenv.get(EnvVariables.APP_NAME));
    System.setProperty(EnvVariables.PORT, dotenv.get(EnvVariables.PORT));
    System.setProperty(EnvVariables.DB_URL, dotenv.get(EnvVariables.DB_URL));
    System.setProperty(EnvVariables.DB_USERNAME, dotenv.get(EnvVariables.DB_USERNAME));
    System.setProperty(EnvVariables.DB_PASSWORD, dotenv.get(EnvVariables.DB_PASSWORD));

		SpringApplication.run(HolidateApplication.class, args);
	}
}
