# Implementation Guide: Generate Knowledge Base with AWS S3 Sync

## Overview
This guide explains how to automatically generate `.md` files from the Holidate database and sync them to **AWS S3** for n8n workflow automation.

**Architecture Philosophy**: Backend generates markdown content → Uploads to AWS S3 → n8n watches S3 events → Processes embeddings → Updates Vector DB.

---

## Architecture (Updated for AWS S3 Sync)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE BASE GENERATOR (Backend)                    │
│                                                                           │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────────┐          │
│  │  Extractor   │──▶│  Transformer │──▶│   AWS S3 Upload    │          │
│  │  (SQL/JPA)   │   │  (DTO→MD)    │   │  (Upload/Update)   │          │
│  └──────────────┘   └──────────────┘   └────────────────────┘          │
│         │                   │                       │                    │
│         ▼                   ▼                       ▼                    │
│   Hotel/Room          Frontmatter +         Upload to S3                │
│   DTOs from DB        Markdown Body         (Idempotent PUT)           │
└─────────────────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
                            ┌─────────────────────────────────────┐
                            │         AWS S3 Bucket               │
                            │  knowledge_base/vietnam/{city}/...  │
                            └─────────────────────────────────────┘
                                                      │
                                                      ▼ (S3 Event → n8n)
                            ┌─────────────────────────────────────┐
                            │         n8n Workflow                │
                            │  1. Detect S3 event (PUT)           │
                            │  2. Download file from S3           │
                            │  3. Extract content                 │
                            │  4. Generate embeddings (OpenAI)    │
                            │  5. Upsert to Vector DB (Pinecone)  │
                            └─────────────────────────────────────┘
                                                      │
                                                      ▼
                            ┌─────────────────────────────────────┐
                            │       Vector Database               │
                            │   (Pinecone/Weaviate/Chroma)        │
                            └─────────────────────────────────────┘
```

**Key Benefits**:
- ✅ **Separation of Concerns**: Backend focuses on data transformation, n8n handles vector operations
- ✅ **Simpler Architecture**: No folder hierarchy management needed (path-based keys)
- ✅ **No-code Workflow**: Change embedding model or vector DB without touching Java code
- ✅ **Event-Driven**: Native S3 events trigger n8n workflows automatically
- ✅ **Better Performance**: Single PUT operation (no folder checks/creation)
- ✅ **No API Quotas**: S3 has no rate limits like Google Drive API

---

## Phase 1: Data Extraction

### 1.1 Create Dedicated DTOs

Create specialized DTOs for knowledge base generation (separate from API DTOs):

```java
// src/main/java/com/webapp/holidate/dto/knowledgebase/HotelKnowledgeBaseDto.java
@Data
@Builder
public class HotelKnowledgeBaseDto {
    // Basic Info
    private String hotelId;
    private String slug;
    private String name;
    private String description;
    private Integer starRating;
    private String status;
    
    // Location Hierarchy
    private LocationHierarchyDto location;
    
    // Amenities
    private List<AmenityTagDto> amenities;
    private List<String> amenityEnglishTags;
    
    // Rooms
    private List<RoomSummaryDto> rooms;
    private PriceReferenceDto priceReference;
    
    // Nearby Venues
    private List<NearbyVenueDto> nearbyVenues;
    
    // Policies
    private HotelPolicyDto policy;
    
    // Stats
    private Integer totalRooms;
    private Integer availableRoomTypes;
    private Double reviewScore;
    private Integer reviewCount;
    
    // Metadata
    private List<String> vibeTagsInferred;
    private List<String> locationTags;
    private LocalDateTime lastUpdated;
}

@Data
@Builder
public class LocationHierarchyDto {
    private String country;
    private String countryCode;
    private String province;
    private String provinceName;
    private String city;
    private String cityName;
    private String citySlug;
    private String district;
    private String districtName;
    private String districtSlug;
    private String ward;
    private String wardName;
    private String street;
    private String streetName;
    private String address;
    private Double latitude;
    private Double longitude;
}

@Data
@Builder
public class PriceReferenceDto {
    private Double referenceMinPrice;
    private String referenceMinPriceRoomName;
    private Double referenceMaxPrice;
    private String referenceMaxPriceRoomName;
}

@Data
@Builder
public class NearbyVenueDto {
    private String name;
    private String distance; // Pre-calculated: "200m", "5km"
    private String category;
    private String description;
}
```

### 1.2 Implement Repository Query

```java
// src/main/java/com/webapp/holidate/repository/KnowledgeBaseRepository.java
public interface KnowledgeBaseRepository extends JpaRepository<Hotel, String> {
    
    @Query("""
        SELECT DISTINCT h FROM Hotel h
        LEFT JOIN FETCH h.country
        LEFT JOIN FETCH h.province
        LEFT JOIN FETCH h.city
        LEFT JOIN FETCH h.district
        LEFT JOIN FETCH h.ward
        LEFT JOIN FETCH h.street
        LEFT JOIN FETCH h.amenities ha
        LEFT JOIN FETCH ha.amenity
        LEFT JOIN FETCH h.rooms r
        LEFT JOIN FETCH r.amenities ra
        LEFT JOIN FETCH ra.amenity
        LEFT JOIN FETCH h.policy hp
        LEFT JOIN FETCH hp.cancellationPolicy
        LEFT JOIN FETCH hp.reschedulePolicy
        LEFT JOIN FETCH h.entertainmentVenues hev
        LEFT JOIN FETCH hev.entertainmentVenue ev
        LEFT JOIN FETCH ev.category
        WHERE h.status = 'active'
        AND EXISTS (SELECT 1 FROM Room r2 WHERE r2.hotel = h AND r2.status = 'active')
    """)
    List<Hotel> findAllActiveHotelsForKnowledgeBase();
    
    @Query("""
        SELECT new com.webapp.holidate.dto.knowledgebase.PriceReferenceDto(
            MIN(r.basePricePerNight),
            (SELECT r2.name FROM Room r2 
             WHERE r2.hotel.id = :hotelId 
             AND r2.status = 'active' 
             AND r2.basePricePerNight = MIN(r.basePricePerNight)),
            MAX(r.basePricePerNight),
            (SELECT r3.name FROM Room r3 
             WHERE r3.hotel.id = :hotelId 
             AND r3.status = 'active' 
             AND r3.basePricePerNight = MAX(r.basePricePerNight))
        )
        FROM Room r
        WHERE r.hotel.id = :hotelId
        AND r.status = 'active'
        GROUP BY r.hotel.id
    """)
    PriceReferenceDto findPriceReferenceByHotelId(@Param("hotelId") String hotelId);
}
```

### 1.3 Calculate Review Stats

```java
@Query("""
    SELECT new com.webapp.holidate.dto.knowledgebase.ReviewStatsDto(
        AVG(r.score),
        COUNT(r.id)
    )
    FROM Review r
    WHERE r.hotel.id = :hotelId
""")
ReviewStatsDto getReviewStatsByHotelId(@Param("hotelId") String hotelId);
```

---

## Phase 2: Transformation Logic

### 2.1 Create KnowledgeBaseService

```java
@Service
@RequiredArgsConstructor
public class KnowledgeBaseGenerationService {
    private final KnowledgeBaseRepository repository;
    private final VibeInferenceService vibeInferenceService;
    private final LocationTagService locationTagService;
    private final SlugService slugService;
    
    public HotelKnowledgeBaseDto buildHotelKB(Hotel hotel) {
        return HotelKnowledgeBaseDto.builder()
            .hotelId(hotel.getId())
            .slug(slugService.generateSlug(hotel.getName()))
            .name(hotel.getName())
            .description(hotel.getDescription())
            .starRating(hotel.getStarRating())
            .status(hotel.getStatus())
            .location(buildLocationHierarchy(hotel))
            .amenities(buildAmenityList(hotel))
            .amenityEnglishTags(mapAmenitiesToEnglishTags(hotel.getAmenities()))
            .rooms(buildRoomSummaries(hotel.getRooms()))
            .priceReference(repository.findPriceReferenceByHotelId(hotel.getId()))
            .nearbyVenues(buildNearbyVenues(hotel.getEntertainmentVenues()))
            .policy(buildPolicyDto(hotel.getPolicy()))
            .totalRooms(hotel.getRooms().size())
            .availableRoomTypes(countActiveRoomTypes(hotel.getRooms()))
            .reviewScore(getReviewScore(hotel.getId()))
            .reviewCount(getReviewCount(hotel.getId()))
            .vibeTagsInferred(vibeInferenceService.inferVibeTags(hotel))
            .locationTags(locationTagService.generateLocationTags(hotel))
            .lastUpdated(LocalDateTime.now())
            .build();
    }
    
    private LocationHierarchyDto buildLocationHierarchy(Hotel hotel) {
        return LocationHierarchyDto.builder()
            .country("vietnam")
            .countryCode(hotel.getCountry().getCode())
            .province(slugService.generateSlug(hotel.getProvince().getName()))
            .provinceName(hotel.getProvince().getName())
            .city(slugService.generateSlug(hotel.getCity().getName()))
            .cityName(hotel.getCity().getName())
            .citySlug(slugService.generateSlug(hotel.getCity().getName()))
            .district(slugService.generateSlug(hotel.getDistrict().getName()))
            .districtName(hotel.getDistrict().getName())
            .districtSlug(slugService.generateSlug(hotel.getDistrict().getName()))
            .ward(slugService.generateSlug(hotel.getWard().getName()))
            .wardName(hotel.getWard().getName())
            .street(slugService.generateSlug(hotel.getStreet().getName()))
            .streetName(hotel.getStreet().getName())
            .address(hotel.getAddress())
            .latitude(hotel.getLatitude())
            .longitude(hotel.getLongitude())
            .build();
    }
    
    private List<String> mapAmenitiesToEnglishTags(Set<HotelAmenity> amenities) {
        // Map Vietnamese amenity names to English keys
        Map<String, String> mapping = loadAmenityMapping(); // Load from config
        
        return amenities.stream()
            .map(ha -> mapping.getOrDefault(ha.getAmenity().getName(), 
                                            slugService.toSnakeCase(ha.getAmenity().getName())))
            .collect(Collectors.toList());
    }
}
```

### 2.2 Implement Vibe Inference

```java
@Service
public class VibeInferenceService {
    
    public List<String> inferVibeTags(Hotel hotel) {
        List<String> vibes = new ArrayList<>();
        
        // Rule 1: Luxury
        if (hotel.getStarRating() >= 5 
            || hasAmenities(hotel, List.of("spa", "pool", "fine_dining"))
            || getMinPrice(hotel) >= 3_000_000) {
            vibes.add("luxury");
        }
        
        // Rule 2: Romantic
        if (hasAmenities(hotel, List.of("spa", "couple_massage"))
            || hotel.getCity().getName().contains("biển")
            && hotel.getStarRating() >= 4) {
            vibes.add("romantic");
        }
        
        // Rule 3: Family Friendly
        if (hasAmenities(hotel, List.of("kids_club", "kids_pool", "playground"))) {
            vibes.add("family_friendly");
        }
        
        // Rule 4: Business
        if (hasAmenities(hotel, List.of("meeting_room", "business_center"))) {
            vibes.add("business");
        }
        
        // Rule 5: Beach Resort
        if (hotel.getEntertainmentVenues().stream()
                .anyMatch(hev -> hev.getEntertainmentVenue().getName().contains("biển"))) {
            vibes.add("beach_resort");
        }
        
        return vibes;
    }
    
    private boolean hasAmenities(Hotel hotel, List<String> requiredTags) {
        Set<String> hotelTags = hotel.getAmenities().stream()
            .map(ha -> slugService.toSnakeCase(ha.getAmenity().getName()))
            .collect(Collectors.toSet());
        
        return requiredTags.stream().anyMatch(hotelTags::contains);
    }
}
```

---

## Phase 3: AWS S3 Integration

### 3.1 Setup Dependencies

The AWS SDK for Java is already included in the project. Ensure you have:

```xml
<!-- AWS SDK for S3 (already in build.gradle.kts) -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.0</version>
</dependency>

<!-- Template Engine -->
<dependency>
    <groupId>com.github.spullara.mustache.java</groupId>
    <artifactId>compiler</artifactId>
    <version>0.9.10</version>
</dependency>

<!-- YAML Parser -->
<dependency>
    <groupId>org.yaml</groupId>
    <artifactId>snakeyaml</artifactId>
    <version>2.0</version>
</dependency>
```

### 3.2 AWS S3 Configuration

#### A. Create S3 Bucket

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to S3 service
3. Create a new bucket (e.g., `holidate-knowledge-base`)
4. Configure bucket permissions (ensure your application IAM role has read/write access)
5. (Optional) Enable versioning for file history
6. (Optional) Configure S3 Event Notifications to trigger n8n webhook

#### B. Application Properties

```properties
# application.properties (already configured)
spring.aws.s3.access-key=${AWS_S3_ACCESS_KEY}
spring.aws.s3.secret-key=${AWS_S3_SECRET_KEY}
spring.aws.s3.bucket-name=${AWS_S3_BUCKET_NAME}
spring.aws.s3.region=${AWS_S3_REGION}
spring.aws.s3.base-url=${AWS_S3_BASE_URL}

# Knowledge Base specific
knowledgebase.s3.root-folder=knowledge_base/
```

### 3.3 S3 Knowledge Base Service Implementation

```java
// src/main/java/com/webapp/holidate/service/storage/S3KnowledgeBaseService.java
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
            
            // Create PUT request (idempotent - overwrites if exists)
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
```

### 3.4 Markdown Generation & Upload Service

```java
// src/main/java/com/webapp/holidate/service/knowledgebase/KnowledgeBaseUploadService.java
@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeBaseUploadService {
    
    private final S3KnowledgeBaseService s3Service;
    private final MustacheFactory mustacheFactory = new DefaultMustacheFactory();
    
    /**
     * Generate markdown and upload to AWS S3
     */
    public String generateAndUploadHotelProfile(HotelKnowledgeBaseDto dto) throws IOException {
        // 1. Load template
        Mustache template = mustacheFactory.compile("templates/template_hotel_profile.md");
        
        // 2. Prepare context
        Map<String, Object> context = buildTemplateContext(dto);
        
        // 3. Render markdown
        StringWriter writer = new StringWriter();
        template.execute(writer, context);
        String markdownContent = writer.toString();
        
        // 4. Build relative path
        String relativePath = buildRelativePath(dto);
        // Example: vietnam/da-nang/son-tra/hotels/grand-mercure-danang.md
        
        // 5. Upload to S3
        String objectKey = s3Service.uploadOrUpdateMarkdown(markdownContent, relativePath);
        
        log.info("✓ Uploaded hotel profile: {} → S3 Key: {}", dto.getName(), objectKey);
        return objectKey;
    }
    
    /**
     * Generate room detail and upload
     */
    public String generateAndUploadRoomDetail(RoomKnowledgeBaseDto dto) throws IOException {
        Mustache template = mustacheFactory.compile("templates/template_room_detail.md");
        
        Map<String, Object> context = buildRoomTemplateContext(dto);
        
        StringWriter writer = new StringWriter();
        template.execute(writer, context);
        String markdownContent = writer.toString();
        
        String relativePath = buildRoomRelativePath(dto);
        // Example: vietnam/da-nang/son-tra/hotels/grand-mercure-danang/deluxe-ocean-view.md
        
        String objectKey = s3Service.uploadOrUpdateMarkdown(markdownContent, relativePath);
        
        log.info("✓ Uploaded room detail: {} → S3 Key: {}", dto.getRoomName(), objectKey);
        return objectKey;
    }
    
    /**
     * Build relative path for hotel
     */
    private String buildRelativePath(HotelKnowledgeBaseDto dto) {
        return String.format(
            "vietnam/%s/%s/hotels/%s.md",
            dto.getLocation().getCitySlug(),
            dto.getLocation().getDistrictSlug(),
            dto.getSlug()
        );
    }
    
    /**
     * Build relative path for room
     */
    private String buildRoomRelativePath(RoomKnowledgeBaseDto dto) {
        return String.format(
            "vietnam/%s/%s/hotels/%s/%s.md",
            dto.getLocation().getCitySlug(),
            dto.getLocation().getDistrictSlug(),
            dto.getParentHotelSlug(),
            dto.getSlug()
        );
    }
    
    /**
     * Build Mustache context from DTO
     */
    private Map<String, Object> buildTemplateContext(HotelKnowledgeBaseDto dto) {
        Map<String, Object> ctx = new HashMap<>();
        
        // Frontmatter
        ctx.put("doc_id", dto.getHotelId());
        ctx.put("slug", dto.getSlug());
        ctx.put("name", dto.getName());
        ctx.put("star_rating", dto.getStarRating());
        ctx.put("reference_min_price", dto.getPriceReference().getReferenceMinPrice());
        ctx.put("reference_min_price_room", dto.getPriceReference().getReferenceMinPriceRoomName());
        
        // Location (nested)
        ctx.put("location", Map.of(
            "country", dto.getLocation().getCountry(),
            "city", dto.getLocation().getCityName(),
            "district", dto.getLocation().getDistrictName(),
            "address", dto.getLocation().getAddress()
        ));
        
        // Tags (arrays)
        ctx.put("amenity_tags", dto.getAmenityEnglishTags());
        ctx.put("vibe_tags", dto.getVibeTagsInferred());
        ctx.put("location_tags", dto.getLocationTags());
        
        // Body content
        ctx.put("description", dto.getDescription());
        ctx.put("nearby_venues", dto.getNearbyVenues());
        ctx.put("rooms", dto.getRooms());
        
        return ctx;
    }
    
    private Map<String, Object> buildRoomTemplateContext(RoomKnowledgeBaseDto dto) {
        // Similar implementation for rooms
        // ...
    }
}
```

---

## Phase 4: Batch Generation Script

### 4.1 Create CLI Command

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class KnowledgeBaseGenerationCommand implements CommandLineRunner {
    
    private final KnowledgeBaseGenerationService generationService;
    private final KnowledgeBaseUploadService uploadService;
    private final KnowledgeBaseRepository repository;
    
    @Value("${knowledgebase.generation.enabled:false}")
    private boolean enabled;
    
    @Override
    public void run(String... args) throws Exception {
        if (!enabled) {
            return;
        }
        
        log.info("=== Starting Knowledge Base Generation & Upload to AWS S3 ===");
        
        List<Hotel> hotels = repository.findAllActiveHotelsForKnowledgeBase();
        log.info("Found {} active hotels to process", hotels.size());
        
        int successCount = 0;
        int errorCount = 0;
        
        for (Hotel hotel : hotels) {
            try {
                // Build DTO
                HotelKnowledgeBaseDto dto = generationService.buildHotelKB(hotel);
                
                // Generate markdown & upload to S3
                String objectKey = uploadService.generateAndUploadHotelProfile(dto);
                
                // Generate room details
                for (Room room : hotel.getRooms()) {
                    if ("active".equals(room.getStatus())) {
                        RoomKnowledgeBaseDto roomDto = generationService.buildRoomKB(room);
                        uploadService.generateAndUploadRoomDetail(roomDto);
                    }
                }
                
                successCount++;
                log.info("✓ [{}] {} → S3", successCount, hotel.getName());
                
            } catch (Exception e) {
                errorCount++;
                log.error("✗ Failed to process hotel: {}", hotel.getName(), e);
            }
        }
        
        log.info("=== Generation Completed ===");
        log.info("Success: {}, Errors: {}", successCount, errorCount);
    }
}
```

### 4.2 Run via Spring Boot Profile

```bash
# Enable KB generation
java -jar holidate.jar \
  --spring.profiles.active=kb-generation \
  --knowledgebase.generation.enabled=true
```

### 4.3 Scheduled Regeneration

```java
@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class KnowledgeBaseScheduler {
    
    private final KnowledgeBaseGenerationService generationService;
    private final KnowledgeBaseUploadService uploadService;
    private final KnowledgeBaseRepository repository;
    
    /**
     * Full regeneration every Sunday at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    public void weeklyFullRegeneration() {
        log.info("Starting weekly full KB regeneration...");
        
        List<Hotel> hotels = repository.findAllActiveHotelsForKnowledgeBase();
        
        for (Hotel hotel : hotels) {
            try {
                HotelKnowledgeBaseDto dto = generationService.buildHotelKB(hotel);
                uploadService.generateAndUploadHotelProfile(dto);
            } catch (Exception e) {
                log.error("Error regenerating hotel: {}", hotel.getName(), e);
            }
        }
        
        log.info("✓ Weekly regeneration completed");
    }
    
    /**
     * Incremental update every hour (only modified hotels)
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void incrementalUpdate() {
        LocalDateTime lastRun = getLastRunTime();
        
        List<Hotel> modifiedHotels = repository.findByUpdatedAtAfter(lastRun);
        
        if (modifiedHotels.isEmpty()) {
            log.debug("No hotels modified since last run");
            return;
        }
        
        log.info("Incremental update: {} hotels modified", modifiedHotels.size());
        
        for (Hotel hotel : modifiedHotels) {
            try {
                HotelKnowledgeBaseDto dto = generationService.buildHotelKB(hotel);
                uploadService.generateAndUploadHotelProfile(dto);
            } catch (Exception e) {
                log.error("Error updating hotel: {}", hotel.getName(), e);
            }
        }
        
        saveLastRunTime(LocalDateTime.now());
    }
    
    private LocalDateTime getLastRunTime() {
        // Retrieve from database or cache
        // ...
    }
    
    private void saveLastRunTime(LocalDateTime time) {
        // Save to database or cache
        // ...
    }
}
```

---

## Phase 5: n8n Workflow Integration

### 5.1 Overview

**Backend's job is done** after uploading markdown to AWS S3. The rest is handled by **n8n workflow automation** triggered by S3 events.

### 5.2 n8n Workflow Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    n8n Workflow (No-Code)                       │
└────────────────────────────────────────────────────────────────┘

[1] S3 Event Trigger (Webhook)
    ↓ (Receives S3 PUT event notification)
    │
    ├─ Event: Object Created (PUT)
    └─ Event: Object Replaced (PUT to existing key)

[2] Download File from S3
    ↓ (Get object from S3 bucket)
    │
    └─ Extract: Frontmatter (YAML) + Body (Markdown)

[3] Parse Frontmatter
    ↓ (Extract metadata: doc_id, location, amenity_tags, etc.)
    │
    └─ Store in variables

[4] Generate Embedding
    ↓ (Send body content to OpenAI API)
    │
    ├─ Model: text-embedding-3-small (or PhoBERT for Vietnamese)
    └─ Output: Vector embedding (1536 dimensions)

[5] Upsert to Vector DB
    ↓ (Pinecone/Weaviate/Chroma)
    │
    ├─ ID: doc_id (from frontmatter)
    ├─ Vector: embedding (from step 4)
    ├─ Metadata: {location, amenity_tags, vibe_tags, price, ...}
    └─ Namespace: "holidate-kb"

[6] Success Notification (Optional)
    ↓
    └─ Slack/Discord: "✓ Indexed: grand-mercure-danang.md"
```

### 5.3 S3 Event Configuration

First, configure S3 to send events to n8n webhook:

1. Go to AWS S3 Console → Your bucket → Properties → Event notifications
2. Create event notification:
   - **Event type**: `s3:ObjectCreated:*` (PUT operations)
   - **Prefix**: `knowledge_base/`
   - **Suffix**: `.md`
   - **Destination**: HTTP/HTTPS endpoint (your n8n webhook URL)

### 5.4 n8n Workflow Configuration (JSON)

Save this as `holidate-kb-sync.json` and import to n8n:

```json
{
  "name": "Holidate KB → Vector DB Sync",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "s3-kb-webhook",
        "responseMode": "responseNode"
      },
      "name": "S3 Webhook",
      "type": "n8n-nodes-base.webhook",
      "webhookId": "s3-kb-trigger"
    },
    {
      "parameters": {
        "jsCode": "// Extract S3 event data\nconst s3Event = items[0].json;\nconst record = s3Event.Records?.[0];\nconst bucket = record?.s3?.bucket?.name;\nconst key = decodeURIComponent(record?.s3?.object?.key?.replace(/\\+/g, ' '));\n\nreturn [{\n  json: {\n    bucket: bucket,\n    key: key,\n    eventName: record?.eventName\n  }\n}];"
      },
      "name": "Parse S3 Event",
      "type": "n8n-nodes-base.code"
    },
    {
      "parameters": {
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "aws",
        "operation": "getObject",
        "bucket": "={{ $json.bucket }}",
        "key": "={{ $json.key }}"
      },
      "name": "Download from S3",
      "type": "n8n-nodes-base.aws"
    },
    {
      "parameters": {
        "jsCode": "// Parse frontmatter and body\nconst content = items[0].binary.data.toString('utf8');\nconst parts = content.split('---');\nconst frontmatter = YAML.parse(parts[1]);\nconst body = parts[2];\n\nreturn [{\n  json: {\n    doc_id: frontmatter.doc_id,\n    metadata: frontmatter,\n    content: body\n  }\n}];"
      },
      "name": "Parse Markdown",
      "type": "n8n-nodes-base.code"
    },
    {
      "parameters": {
        "resource": "text",
        "operation": "embed",
        "model": "text-embedding-3-small",
        "text": "={{ $json.content }}"
      },
      "name": "OpenAI Embedding",
      "type": "n8n-nodes-base.openAi"
    },
    {
      "parameters": {
        "operation": "upsert",
        "id": "={{ $json.doc_id }}",
        "vector": "={{ $json.embedding }}",
        "metadata": "={{ $json.metadata }}"
      },
      "name": "Pinecone Upsert",
      "type": "n8n-nodes-base.pinecone"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"status\": \"success\", \"doc_id\": $json.doc_id } }}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook"
    }
  ],
  "connections": {
    "S3 Webhook": { "main": [[{ "node": "Parse S3 Event" }]] },
    "Parse S3 Event": { "main": [[{ "node": "Download from S3" }]] },
    "Download from S3": { "main": [[{ "node": "Parse Markdown" }]] },
    "Parse Markdown": { "main": [[{ "node": "OpenAI Embedding" }]] },
    "OpenAI Embedding": { "main": [[{ "node": "Pinecone Upsert" }]] },
    "Pinecone Upsert": { "main": [[{ "node": "Respond to Webhook" }]] }
  }
}
```

### 5.4 Benefits of n8n Approach

| Aspect | Backend Approach | n8n Approach ✓ |
|--------|------------------|----------------|
| **Code Changes** | Redeploy Java app | Edit workflow in UI |
| **Embedding Model** | Hardcoded in Java | Swap node, no code |
| **Vector DB** | Tight coupling | Swap Pinecone → Weaviate in 1 click |
| **Error Handling** | Java try-catch | Visual error branches |
| **Monitoring** | Custom logging | Built-in execution history |
| **Testing** | Unit tests | Test with 1 file |
| **Debugging** | IntelliJ debugger | See data in each node |

---

## Phase 6: Incremental Updates

### 6.1 Event-Driven Updates

```java
// Listen to domain events
@EventListener
public void onHotelUpdated(HotelUpdatedEvent event) {
    try {
        Hotel hotel = repository.findById(event.getHotelId())
            .orElseThrow();
        
        HotelKnowledgeBaseDto dto = generationService.buildHotelKB(hotel);
        uploadService.generateAndUploadHotelProfile(dto);
        
        log.info("✓ Auto-updated KB for hotel: {}", hotel.getName());
    } catch (Exception e) {
        log.error("Failed to update KB for hotel: {}", event.getHotelId(), e);
    }
}

@EventListener
public void onHotelDeleted(HotelDeletedEvent event) {
    // Note: We keep the file on S3 but mark it inactive
    // Let n8n workflow handle cleanup based on status field
    log.info("Hotel deleted: {}. n8n will handle cleanup.", event.getHotelId());
}
```

---

## Testing Strategy

### Unit Tests

```java
@Test
public void testS3Upload() {
    // Given
    String markdown = "---\ndoc_id: test-123\n---\n# Test Hotel";
    String path = "vietnam/da-nang/test/hotels/test-hotel.md";
    
    // When
    String objectKey = s3Service.uploadOrUpdateMarkdown(markdown, path);
    
    // Then
    assertNotNull(objectKey);
    assertTrue(objectKey.contains("knowledge_base/"));
    assertTrue(objectKey.endsWith("test-hotel.md"));
}

@Test
public void testFileExists() {
    // Upload a file first
    String path = "vietnam/da-nang/test/hotels/test-hotel.md";
    s3Service.uploadOrUpdateMarkdown("test content", path);
    
    // Then check existence
    assertTrue(s3Service.fileExists(path));
    assertFalse(s3Service.fileExists("non-existent-file.md"));
}

@Test
public void testIdempotentUpload() {
    // Upload once
    String path = "test.md";
    String objectKey1 = s3Service.uploadOrUpdateMarkdown("v1", path);
    
    // Upload again (should overwrite, same key)
    String objectKey2 = s3Service.uploadOrUpdateMarkdown("v2", path);
    
    assertEquals(objectKey1, objectKey2); // Same object key = overwritten
    
    // Verify content was updated
    // (You would need to download and check content in integration test)
}
```

### Integration Test

```java
@SpringBootTest
@ActiveProfiles("test")
class KnowledgeBaseIntegrationTest {
    
    @Autowired
    private KnowledgeBaseUploadService uploadService;
    
    @Autowired
    private HotelRepository hotelRepo;
    
    @Test
    void testEndToEndGeneration() throws IOException {
        // Given: A real hotel from test database
        Hotel hotel = hotelRepo.findById("test-hotel-id").orElseThrow();
        
        // When: Generate and upload
        HotelKnowledgeBaseDto dto = generationService.buildHotelKB(hotel);
        String objectKey = uploadService.generateAndUploadHotelProfile(dto);
        
        // Then: File should exist on S3
        assertNotNull(objectKey);
        assertTrue(s3Service.fileExists(objectKey));
        
        // Verify file content (would need S3 download method)
        // String content = s3Service.downloadFile(objectKey);
        // assertTrue(content.contains("doc_id: \"" + hotel.getId() + "\""));
        // assertTrue(content.contains("# " + hotel.getName()));
    }
}
```

---

## Performance Optimization

### 1. Parallel Processing

```java
@Service
public class ParallelKBGenerationService {
    
    @Async
    public CompletableFuture<String> generateHotelAsync(Hotel hotel) {
        try {
            HotelKnowledgeBaseDto dto = generationService.buildHotelKB(hotel);
            String fileId = uploadService.generateAndUploadHotelProfile(dto);
            return CompletableFuture.completedFuture(fileId);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }
    
    public void generateAllHotelsInParallel(List<Hotel> hotels) {
        List<CompletableFuture<String>> futures = hotels.stream()
            .map(this::generateHotelAsync)
            .collect(Collectors.toList());
        
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    }
}
```

### 2. Rate Limiting (S3)

S3 has no API quotas, but you can still implement rate limiting for cost control:

```java
@Component
public class S3RateLimiter {
    private final RateLimiter rateLimiter = RateLimiter.create(100.0); // 100 req/sec (S3 supports much higher)
    
    public void acquirePermit() {
        rateLimiter.acquire();
    }
}

// Usage in S3KnowledgeBaseService (optional)
public String uploadOrUpdateMarkdown(String content, String relativePath) {
    rateLimiter.acquirePermit(); // Optional - S3 can handle high throughput
    // ... proceed with upload
}
```

### 3. Parallel Processing

S3 supports high concurrency. No folder caching needed - path-based keys are automatic.

---

## Monitoring & Logging

### Custom Metrics

```java
@Aspect
@Component
public class KBGenerationMetrics {
    private final MeterRegistry registry;
    
    @Around("execution(* com.webapp.holidate.service.knowledgebase.*.generate*(..))")
    public Object trackGenerationTime(ProceedingJoinPoint joinPoint) throws Throwable {
        Timer.Sample sample = Timer.start(registry);
        try {
            return joinPoint.proceed();
        } finally {
            sample.stop(registry.timer("kb.generation.time", 
                                       "method", joinPoint.getSignature().getName()));
        }
    }
    
    @AfterReturning("execution(* com.webapp.holidate.service.storage.S3KnowledgeBaseService.upload*(..))")
    public void countUploads() {
        registry.counter("kb.s3.uploads").increment();
    }
}
```

---

## Deployment Checklist

- [ ] Create AWS S3 bucket (or use existing)
- [ ] Configure S3 bucket permissions (IAM role/policy)
- [ ] Set up S3 Event Notifications → n8n webhook
- [ ] Configure AWS credentials in environment variables
- [ ] Update `application.properties` with S3 bucket name and root folder
- [ ] Test upload with 1 hotel
- [ ] Setup n8n workflow (import JSON)
- [ ] Configure n8n credentials (AWS, OpenAI, Pinecone)
- [ ] Test S3 event trigger → n8n webhook
- [ ] Test end-to-end: Backend → S3 → n8n → Vector DB
- [ ] Enable scheduled jobs
- [ ] Setup monitoring alerts (CloudWatch)
- [ ] Document S3 bucket structure for team

---

## Troubleshooting

### Issue: "Access Denied" error when uploading to S3

**Solution**:
1. Check IAM role/policy has `s3:PutObject` permission for the bucket
2. Verify AWS credentials are correctly configured in environment variables
3. Check bucket policy allows your IAM user/role to write
4. Ensure bucket name is correct in `application.properties`

### Issue: Files not appearing in S3

**Solution**:
- Check object key path is correct (use `s3Service.getObjectUrl()` to verify)
- Verify bucket name and region are correct
- Check CloudWatch logs for S3 errors
- Ensure UTF-8 encoding is preserved

### Issue: n8n workflow not triggering from S3 events

**Solution**:
1. Verify S3 Event Notification is configured correctly
2. Check webhook URL is accessible from AWS
3. Test webhook manually with a test S3 event
4. Check n8n execution history for errors
5. Verify S3 event notification destination (HTTP/HTTPS endpoint)
6. Check n8n webhook is active and listening

---

## Estimated Resources

| Metric                     | Estimation                         |
|----------------------------|------------------------------------|
| **Processing Time**        | ~500 hotels/minute (parallel, no API limits) |
| **S3 Storage**             | ~5KB per hotel, 3KB per room       |
| **Total for 1000 hotels**  | ~8MB on S3                         |
| **S3 API Quota**           | No limits (pay per request)       |
| **S3 Storage Cost**        | ~$0.023 per GB/month               |
| **S3 PUT Requests**        | ~$0.005 per 1000 requests         |
| **n8n Processing**         | ~10 files/minute (embedding)       |

---

## Next Steps

1. **Implement Phase 1-3** in your codebase
2. **Test with 1 hotel** first
3. **Setup S3 Event Notifications** to trigger n8n webhook
4. **Setup n8n workflow** and test S3 → Vector DB flow
5. **Scale to batch generation**
6. **Monitor and optimize**

---

This implementation guide provides a complete, production-ready solution for generating knowledge base content and syncing it via AWS S3 for n8n automation! 🚀
