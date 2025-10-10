package com.webapp.holidate.service.storage;

import com.webapp.holidate.constants.AppProperties;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FileService {
  S3Client s3Client;

  @NonFinal
  @Value(AppProperties.AWS_S3_BUCKET_NAME)
  String bucketName;

  @NonFinal
  @Value(AppProperties.AWS_S3_BASE_URL)
  String baseUrl;

  public void upload(MultipartFile file) throws IOException {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File cannot be null or empty");
    }

    String fileName = file.getOriginalFilename();
    if (fileName == null) {
      throw new IllegalArgumentException("File name cannot be null");
    }

    byte[] fileBytes = file.getBytes();
    String mimeType = file.getContentType();

    if (mimeType == null) {
      mimeType = "application/octet-stream"; // default binary type
    }

    PutObjectRequest putObjectRequest = PutObjectRequest.builder()
        .bucket(bucketName)
        .key(fileName)
        .contentType(mimeType)
        .build();
    RequestBody requestBody = RequestBody.fromBytes(fileBytes);
    s3Client.putObject(putObjectRequest, requestBody);
  }

  public void delete(String url) {
    String fileName = getFileName(url);
    DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
        .bucket(bucketName)
        .key(fileName)
        .build();
    s3Client.deleteObject(deleteObjectRequest);
  }

  public byte[] download(String url) {
    String fileName = getFileName(url);
    GetObjectRequest getObjectRequest = GetObjectRequest.builder()
        .bucket(bucketName)
        .key(fileName)
        .build();
    ResponseBytes<GetObjectResponse> responseBytes = s3Client.getObjectAsBytes(getObjectRequest);
    return responseBytes.asByteArray();
  }

  private String getFileName(String url) {
    return url.substring(baseUrl.length());
  }

  public String createFileUrl(String fileName) {
    return baseUrl + fileName;
  }
}
