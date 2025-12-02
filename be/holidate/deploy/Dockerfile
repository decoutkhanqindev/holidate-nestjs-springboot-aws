# ============================================
# Multi-stage Dockerfile for Spring Boot Application
# Stage 1: Build with Gradle
# Stage 2: Runtime with lightweight JRE
# ============================================

# Stage 1: Build Stage
FROM gradle:8.5-jdk21 AS build

# Set working directory
WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Copy source code
COPY src/ src/

# Make gradlew executable
RUN chmod +x ./gradlew

# Build the application (skip tests for faster builds, remove if you want tests)
RUN ./gradlew build -x test --no-daemon

# Find the built JAR file
RUN find /app/build/libs -name "*.jar" -not -name "*-plain.jar" -exec cp {} /app/app.jar \;

# Stage 2: Runtime Stage
FROM eclipse-temurin:21-jre-alpine

# Add metadata
LABEL maintainer="holidate-team"
LABEL description="Holidate Spring Boot Backend Application"

# Create app user for security (non-root)
RUN addgroup -S spring && adduser -S spring -G spring

# Set working directory
WORKDIR /app

# Copy the JAR from build stage
COPY --from=build /app/app.jar app.jar

# Change ownership to spring user
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

