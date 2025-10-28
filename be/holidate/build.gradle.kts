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
  runtimeOnly("com.mysql:mysql-connector-j")

  implementation("io.github.cdimascio:dotenv-java:3.2.0")

  implementation("org.springframework.boot:spring-boot-starter-data-jpa")

  implementation("org.springframework.security:spring-security-crypto:6.5.1")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
  implementation ("org.springframework.boot:spring-boot-starter-oauth2-client")
  implementation("com.nimbusds:nimbus-jose-jwt:10.3")

  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-validation")

  implementation("org.springframework.boot:spring-boot-starter-thymeleaf")

  implementation("org.springframework.boot:spring-boot-starter-mail:3.5.3")

  implementation("org.springframework.boot:spring-boot-starter-aop")

  compileOnly("org.projectlombok:lombok")
  annotationProcessor("org.projectlombok:lombok")

  implementation("org.mapstruct:mapstruct:1.6.3")
  annotationProcessor("org.mapstruct:mapstruct-processor:1.6.3")

  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
  implementation(kotlin("stdlib-jdk8"))

  implementation("software.amazon.awssdk:s3:2.33.7")
}

tasks.withType<Test> {
  useJUnitPlatform()
}
