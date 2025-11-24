package com.webapp.holidate.service.storage;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * S3 Storage Service for Knowledge Base Markdown Files
 * 
 * Features:
 * - Upload markdown files to S3 bucket
 * - Automatic overwrite (idempotent operations)
 * - UTF-8 encoding support
 * - Metadata tracking
 * 
 * S3 Benefits over Google Drive:
 * - No folder hierarchy management needed
 * - Automatic versioning support
 * - Event-driven triggers for n8n integration
 * - No API quota limits
 */
@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class S3KnowledgeBaseService {

    private static final String MARKDOWN_CONTENT_TYPE = "text/markdown; charset=UTF-8";
    
    S3Client s3Client;
    
    @NonFinal
    @Value("${spring.aws.s3.bucket-name}")
    String bucketName;
    
    @NonFinal
    @Value("${knowledgebase.s3.root-folder:knowledge_base/}")
    String rootFolder;

    /**
     * Upload or update a markdown file to S3
     * 
     * @param content Markdown content
     * @param relativePath Relative path (e.g., "vietnam/da-nang/hotels/grand-mercure.md")
     * @return S3 object key (full path)
     */
    public String uploadOrUpdateMarkdown(String content, String relativePath) {
        String objectKey = buildObjectKey(relativePath);
        
        log.info("Uploading markdown to S3: {}", objectKey);
        
        try {
            // Prepare metadata
            Map<String, String> metadata = new HashMap<>();
            metadata.put("content-type", "markdown");
            metadata.put("encoding", "UTF-8");
            metadata.put("generated-by", "holidate-knowledge-base");
            
            // Create PUT request
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(MARKDOWN_CONTENT_TYPE)
                    .metadata(metadata)
                    .build();
            
            // Upload content
            byte[] contentBytes = content.getBytes(StandardCharsets.UTF_8);
            RequestBody requestBody = RequestBody.fromBytes(contentBytes);
            
            PutObjectResponse response = s3Client.putObject(putObjectRequest, requestBody);
            
            log.info("✓ Successfully uploaded to S3: {} (ETag: {})", objectKey, response.eTag());
            
            return objectKey;
            
        } catch (S3Exception e) {
            log.error("✗ Failed to upload to S3: {} - Error: {}", objectKey, e.awsErrorDetails().errorMessage(), e);
            throw new RuntimeException("Failed to upload markdown to S3: " + e.awsErrorDetails().errorMessage(), e);
        } catch (Exception e) {
            log.error("✗ Unexpected error uploading to S3: {}", objectKey, e);
            throw new RuntimeException("Unexpected error uploading markdown to S3", e);
        }
    }

    /**
     * Delete a markdown file from S3
     * 
     * @param relativePath Relative path
     * @return true if deleted successfully
     */
    public boolean deleteFile(String relativePath) {
        String objectKey = buildObjectKey(relativePath);
        
        log.info("Deleting markdown from S3: {}", objectKey);
        
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            
            s3Client.deleteObject(deleteObjectRequest);
            
            log.info("✓ Successfully deleted from S3: {}", objectKey);
            return true;
            
        } catch (S3Exception e) {
            log.error("✗ Failed to delete from S3: {} - Error: {}", objectKey, e.awsErrorDetails().errorMessage(), e);
            return false;
        }
    }

    /**
     * Check if a file exists in S3
     * 
     * @param relativePath Relative path
     * @return true if file exists
     */
    public boolean fileExists(String relativePath) {
        String objectKey = buildObjectKey(relativePath);
        
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            
            s3Client.headObject(headObjectRequest);
            return true;
            
        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            log.warn("Error checking file existence: {}", objectKey, e);
            return false;
        }
    }

    /**
     * Get the S3 object URL
     * 
     * @param relativePath Relative path
     * @return S3 URL
     */
    public String getObjectUrl(String relativePath) {
        String objectKey = buildObjectKey(relativePath);
        return String.format("s3://%s/%s", bucketName, objectKey);
    }

    /**
     * Build full S3 object key from relative path
     * 
     * @param relativePath Relative path
     * @return Full object key
     */
    private String buildObjectKey(String relativePath) {
        // Ensure rootFolder ends with /
        String normalizedRoot = rootFolder.endsWith("/") ? rootFolder : rootFolder + "/";
        
        // Remove leading slash from relativePath if exists
        String normalizedPath = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
        
        return normalizedRoot + normalizedPath;
    }
}

