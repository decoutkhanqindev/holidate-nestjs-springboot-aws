package com.webapp.holidate.service;

import com.webapp.holidate.constants.AppValues;
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
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FileService {
  S3Client s3Client;

  @NonFinal
  @Value(AppValues.AWS_S3_BUCKET_NAME)
  String bucketName;

  @NonFinal
  @Value(AppValues.AWS_S3_BASE_URL)
  String baseUrl;

  public void upload(MultipartFile file) throws IOException {
    String mimeType = file.getContentType();

    if (mimeType == null) {
      mimeType = "application/octet-stream"; // default binary type
    }

    PutObjectRequest putObjectRequest = PutObjectRequest.builder()
      .bucket(bucketName)
      .key(file.getOriginalFilename())
      .contentType(mimeType)
      .build();
    RequestBody requestBody = RequestBody.fromBytes(file.getBytes());
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
}
