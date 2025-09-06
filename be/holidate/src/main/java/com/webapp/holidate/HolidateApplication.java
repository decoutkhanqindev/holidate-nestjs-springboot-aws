package com.webapp.holidate;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HolidateApplication {
	public static void main(String[] args) {
    Dotenv dotenv = Dotenv.load();
    System.setProperty("APP_NAME", dotenv.get("APP_NAME"));
    System.setProperty("PORT", dotenv.get("PORT"));
    System.setProperty("DB_URL", dotenv.get("DB_URL"));
    System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME"));
    System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));

		SpringApplication.run(HolidateApplication.class, args);
	}
}
