plugins {
  java
  id("org.springframework.boot") version "3.5.5"
  id("io.spring.dependency-management") version "1.1.7"
  kotlin("jvm")
}

group = "com.webapp"
version = "0.0.1-SNAPSHOT"
description = "hotel booking web app"

java {
  toolchain {
    languageVersion = JavaLanguageVersion.of(21)
  }
}

configurations {
  compileOnly {
    extendsFrom(configurations.annotationProcessor.get())
  }
}

repositories {
  mavenCentral()
}

dependencies {
  // Actuator - Health Checks & Metrics
  implementation("org.springframework.boot:spring-boot-starter-actuator")

  // Database
  runtimeOnly("com.mysql:mysql-connector-j")

  // Environment Configuration
  implementation("io.github.cdimascio:dotenv-java:3.2.0")

  // Spring Boot Data JPA
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")

  // Security & OAuth2
  implementation("org.springframework.security:spring-security-crypto:6.5.1")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
  implementation("com.nimbusds:nimbus-jose-jwt:10.3")

  // Web & Validation
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-validation")

  // Template Engine
  implementation("org.springframework.boot:spring-boot-starter-thymeleaf")

  // Email Service
  implementation("org.springframework.boot:spring-boot-starter-mail:3.5.3")

  // Aspect-Oriented Programming
  implementation("org.springframework.boot:spring-boot-starter-aop")

  // Lombok - Reduce Boilerplate Code
  compileOnly("org.projectlombok:lombok")
  annotationProcessor("org.projectlombok:lombok")

  // MapStruct - Object Mapping
  implementation("org.mapstruct:mapstruct:1.6.3")
  annotationProcessor("org.mapstruct:mapstruct-processor:1.6.3")

  // Testing
  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
  implementation(kotlin("stdlib-jdk8"))

  // AWS S3 - Cloud Storage & Knowledge Base Integration
  implementation("software.amazon.awssdk:s3:2.33.7")

  // Mustache Template Engine - Markdown File Rendering  
  implementation("com.github.spullara.mustache.java:compiler:0.9.11")

  // YAML Parser - Frontmatter Processing
  implementation("org.yaml:snakeyaml:2.2")
}

tasks.withType<Test> {
  useJUnitPlatform()
}
