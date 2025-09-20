package com.webapp.holidate.config.aws;

import com.webapp.holidate.constants.AppValues;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class S3Config {
  @Value(AppValues.AWS_S3_ACCESS_KEY)
  String accessKey;

  @Value(AppValues.AWS_S3_SECRET_KEY)
  String secretKey;

  @Value(AppValues.AWS_S3_REGION)
  String region;

  @Bean
  public S3Client s3Client() {
    Region awsRegion = Region.of(region);
    AwsBasicCredentials awsBasicCredentials = AwsBasicCredentials.create(accessKey, secretKey);
    StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(awsBasicCredentials);

    return S3Client.builder()
      .region(awsRegion)
      .credentialsProvider(credentialsProvider)
      .build();
  }
}
