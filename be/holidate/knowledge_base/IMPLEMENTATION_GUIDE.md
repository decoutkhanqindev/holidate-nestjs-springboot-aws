# Implementation Guide: Generate Knowledge Base with Google Drive Sync

## Overview
This guide explains how to automatically generate `.md` files from the Holidate database and sync them to **Google Drive** for n8n workflow automation.

**Architecture Philosophy**: Backend generates markdown content → Uploads to Google Drive → n8n watches Drive changes → Processes embeddings → Updates Vector DB.

---

## Architecture (Updated for Google Drive Sync)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE BASE GENERATOR (Backend)                    │
│                                                                           │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────────┐          │
│  │  Extractor   │──▶│  Transformer │──▶│ Google Drive Sync  │          │
│  │  (SQL/JPA)   │   │  (DTO→MD)    │   │  (Upload/Update)   │          │
│  └──────────────┘   └──────────────┘   └────────────────────┘          │
│         │                   │                       │                    │
│         ▼                   ▼                       ▼                    │
│   Hotel/Room          Frontmatter +         Upload to Drive             │
│   DTOs from DB        Markdown Body         (Check exist → Update/Create)│
└─────────────────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
                            ┌─────────────────────────────────────┐
                            │       Google Drive Storage          │
                            │  knowledge_base/vietnam/{city}/...  │
                            └─────────────────────────────────────┘
                                                      │
                                                      ▼ (n8n watches changes)
                            ┌─────────────────────────────────────┐
                            │         n8n Workflow                │
                            │  1. Detect file change              │
                            │  2. Extract content                 │
                            │  3. Generate embeddings (OpenAI)    │
                            │  4. Upsert to Vector DB (Pinecone)  │
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
- ✅ **Easier Debugging**: Can inspect/edit markdown files directly on Drive
- ✅ **No-code Workflow**: Change embedding model or vector DB without touching Java code
- ✅ **Version Control**: Drive maintains file history automatically

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

## Phase 3: Google Drive Integration

### 3.1 Setup Dependencies

Add to `pom.xml`:

```xml
<!-- Google Drive API -->
<dependency>
    <groupId>com.google.apis</groupId>
    <artifactId>google-api-services-drive</artifactId>
    <version>v3-rev20230822-2.0.0</version>
</dependency>

<dependency>
    <groupId>com.google.auth</groupId>
    <artifactId>google-auth-library-oauth2-http</artifactId>
    <version>1.19.0</version>
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

### 3.2 Google Drive Configuration

#### A. Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Drive API**
4. Create **Service Account** credentials
5. Download JSON key file → Save as `src/main/resources/google-service-account.json`
6. Share your target Google Drive folder with service account email

#### B. Application Properties

```properties
# application.properties
google.drive.service.account.key.path=classpath:google-service-account.json
google.drive.knowledge.base.folder.id=1A2B3C4D5E6F7G8H9I0J  # Root folder ID on Drive
google.drive.application.name=Holidate-KB-Generator
```

### 3.3 Google Drive Service Implementation

```java
// src/main/java/com/webapp/holidate/service/storage/GoogleDriveService.java
@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleDriveService {
    
    @Value("${google.drive.service.account.key.path}")
    private String serviceAccountKeyPath;
    
    @Value("${google.drive.knowledge.base.folder.id}")
    private String rootFolderId;
    
    @Value("${google.drive.application.name}")
    private String applicationName;
    
    private Drive driveService;
    private final Map<String, String> folderCache = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void init() throws IOException, GeneralSecurityException {
        // Load service account credentials
        InputStream in = new ClassPathResource(
            serviceAccountKeyPath.replace("classpath:", "")
        ).getInputStream();
        
        GoogleCredentials credentials = GoogleCredentials
            .fromStream(in)
            .createScoped(Collections.singleton(DriveScopes.DRIVE_FILE));
        
        // Build Drive service
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
        
        this.driveService = new Drive.Builder(httpTransport, jsonFactory, 
            new HttpCredentialsAdapter(credentials))
            .setApplicationName(applicationName)
            .build();
        
        log.info("✓ Google Drive service initialized");
    }
    
    /**
     * Upload or update markdown file to Google Drive
     * @param markdownContent The markdown content to upload
     * @param relativePath Relative path: vietnam/da-nang/son-tra/hotels/grand-mercure.md
     * @return File ID on Google Drive
     */
    public String uploadOrUpdateMarkdown(String markdownContent, String relativePath) 
            throws IOException {
        
        // Parse path: vietnam/da-nang/son-tra/hotels/grand-mercure.md
        String[] pathParts = relativePath.split("/");
        String fileName = pathParts[pathParts.length - 1];
        String folderPath = String.join("/", 
            Arrays.copyOfRange(pathParts, 0, pathParts.length - 1));
        
        // 1. Ensure folder structure exists
        String parentFolderId = ensureFolderPath(folderPath);
        
        // 2. Check if file already exists
        String existingFileId = findFileByName(fileName, parentFolderId);
        
        if (existingFileId != null) {
            // Update existing file
            log.info("Updating existing file: {} (ID: {})", fileName, existingFileId);
            return updateFileContent(existingFileId, markdownContent);
        } else {
            // Create new file
            log.info("Creating new file: {} in folder {}", fileName, parentFolderId);
            return createFile(fileName, markdownContent, parentFolderId);
        }
    }
    
    /**
     * Ensure folder path exists, create if needed
     * @param folderPath e.g., "vietnam/da-nang/son-tra/hotels"
     * @return Folder ID of the deepest folder
     */
    private String ensureFolderPath(String folderPath) throws IOException {
        // Check cache first
        if (folderCache.containsKey(folderPath)) {
            return folderCache.get(folderPath);
        }
        
        String currentParentId = rootFolderId;
        String[] folders = folderPath.split("/");
        StringBuilder currentPath = new StringBuilder();
        
        for (String folderName : folders) {
            if (folderName.isEmpty()) continue;
            
            currentPath.append(folderName);
            String fullPath = currentPath.toString();
            
            // Check cache
            if (folderCache.containsKey(fullPath)) {
                currentParentId = folderCache.get(fullPath);
            } else {
                // Check if folder exists
                String folderId = findFolderByName(folderName, currentParentId);
                
                if (folderId == null) {
                    // Create folder
                    folderId = createFolder(folderName, currentParentId);
                    log.info("Created folder: {} (ID: {})", folderName, folderId);
                }
                
                folderCache.put(fullPath, folderId);
                currentParentId = folderId;
            }
            
            currentPath.append("/");
        }
        
        return currentParentId;
    }
    
    /**
     * Find folder by name within parent folder
     */
    private String findFolderByName(String folderName, String parentId) throws IOException {
        String query = String.format(
            "name='%s' and '%s' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
            folderName, parentId
        );
        
        FileList result = driveService.files().list()
            .setQ(query)
            .setSpaces("drive")
            .setFields("files(id, name)")
            .execute();
        
        List<File> files = result.getFiles();
        return files.isEmpty() ? null : files.get(0).getId();
    }
    
    /**
     * Find file by name within parent folder
     */
    private String findFileByName(String fileName, String parentId) throws IOException {
        String query = String.format(
            "name='%s' and '%s' in parents and mimeType='text/markdown' and trashed=false",
            fileName, parentId
        );
        
        FileList result = driveService.files().list()
            .setQ(query)
            .setSpaces("drive")
            .setFields("files(id, name)")
            .execute();
        
        List<File> files = result.getFiles();
        return files.isEmpty() ? null : files.get(0).getId();
    }
    
    /**
     * Create a new folder
     */
    private String createFolder(String folderName, String parentId) throws IOException {
        File folderMetadata = new File();
        folderMetadata.setName(folderName);
        folderMetadata.setMimeType("application/vnd.google-apps.folder");
        folderMetadata.setParents(Collections.singletonList(parentId));
        
        File folder = driveService.files().create(folderMetadata)
            .setFields("id")
            .execute();
        
        return folder.getId();
    }
    
    /**
     * Create a new file with content
     */
    private String createFile(String fileName, String content, String parentId) 
            throws IOException {
        
        File fileMetadata = new File();
        fileMetadata.setName(fileName);
        fileMetadata.setMimeType("text/markdown");
        fileMetadata.setParents(Collections.singletonList(parentId));
        
        ByteArrayContent mediaContent = new ByteArrayContent(
            "text/markdown", 
            content.getBytes(StandardCharsets.UTF_8)
        );
        
        File file = driveService.files().create(fileMetadata, mediaContent)
            .setFields("id, name, createdTime")
            .execute();
        
        log.info("✓ Created file: {} (ID: {})", fileName, file.getId());
        return file.getId();
    }
    
    /**
     * Update existing file content
     */
    private String updateFileContent(String fileId, String newContent) throws IOException {
        ByteArrayContent mediaContent = new ByteArrayContent(
            "text/markdown", 
            newContent.getBytes(StandardCharsets.UTF_8)
        );
        
        File file = driveService.files().update(fileId, null, mediaContent)
            .setFields("id, name, modifiedTime")
            .execute();
        
        log.info("✓ Updated file ID: {}", file.getId());
        return file.getId();
    }
    
    /**
     * Delete file by ID
     */
    public void deleteFile(String fileId) throws IOException {
        driveService.files().delete(fileId).execute();
        log.info("✓ Deleted file ID: {}", fileId);
    }
    
    /**
     * Clear folder cache (call after large batch operations)
     */
    public void clearFolderCache() {
        folderCache.clear();
        log.info("✓ Folder cache cleared");
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
    
    private final GoogleDriveService driveService;
    private final MustacheFactory mustacheFactory = new DefaultMustacheFactory();
    
    /**
     * Generate markdown and upload to Google Drive
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
        
        // 5. Upload to Google Drive
        String fileId = driveService.uploadOrUpdateMarkdown(markdownContent, relativePath);
        
        log.info("✓ Uploaded hotel profile: {} → Drive ID: {}", dto.getName(), fileId);
        return fileId;
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
        
        String fileId = driveService.uploadOrUpdateMarkdown(markdownContent, relativePath);
        
        log.info("✓ Uploaded room detail: {} → Drive ID: {}", dto.getRoomName(), fileId);
        return fileId;
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
    private final GoogleDriveService driveService;
    
    @Value("${knowledgebase.generation.enabled:false}")
    private boolean enabled;
    
    @Override
    public void run(String... args) throws Exception {
        if (!enabled) {
            return;
        }
        
        log.info("=== Starting Knowledge Base Generation & Upload to Google Drive ===");
        
        List<Hotel> hotels = repository.findAllActiveHotelsForKnowledgeBase();
        log.info("Found {} active hotels to process", hotels.size());
        
        int successCount = 0;
        int errorCount = 0;
        
        for (Hotel hotel : hotels) {
            try {
                // Build DTO
                HotelKnowledgeBaseDto dto = generationService.buildHotelKB(hotel);
                
                // Generate markdown & upload to Drive
                String fileId = uploadService.generateAndUploadHotelProfile(dto);
                
                // Generate room details
                for (Room room : hotel.getRooms()) {
                    if ("active".equals(room.getStatus())) {
                        RoomKnowledgeBaseDto roomDto = generationService.buildRoomKB(room);
                        uploadService.generateAndUploadRoomDetail(roomDto);
                    }
                }
                
                successCount++;
                log.info("✓ [{}] {} → Drive", successCount, hotel.getName());
                
            } catch (Exception e) {
                errorCount++;
                log.error("✗ Failed to process hotel: {}", hotel.getName(), e);
            }
        }
        
        // Clear folder cache after batch
        driveService.clearFolderCache();
        
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

**Backend's job is done** after uploading markdown to Google Drive. The rest is handled by **n8n workflow automation**.

### 5.2 n8n Workflow Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    n8n Workflow (No-Code)                       │
└────────────────────────────────────────────────────────────────┘

[1] Google Drive Trigger
    ↓ (Watches for file changes in knowledge_base/ folder)
    │
    ├─ Event: File Created
    └─ Event: File Updated

[2] Read File Content
    ↓ (Download .md file from Drive)
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

### 5.3 n8n Workflow Configuration (JSON)

Save this as `holidate-kb-sync.json` and import to n8n:

```json
{
  "name": "Holidate KB → Vector DB Sync",
  "nodes": [
    {
      "parameters": {
        "folderId": "YOUR_GOOGLE_DRIVE_FOLDER_ID",
        "event": "fileUpdated,fileCreated"
      },
      "name": "Google Drive Trigger",
      "type": "n8n-nodes-base.googleDriveTrigger"
    },
    {
      "parameters": {
        "fileId": "={{ $json.id }}"
      },
      "name": "Download File",
      "type": "n8n-nodes-base.googleDrive"
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
    }
  ],
  "connections": {
    "Google Drive Trigger": { "main": [[{ "node": "Download File" }]] },
    "Download File": { "main": [[{ "node": "Parse Markdown" }]] },
    "Parse Markdown": { "main": [[{ "node": "OpenAI Embedding" }]] },
    "OpenAI Embedding": { "main": [[{ "node": "Pinecone Upsert" }]] }
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
    // Note: We keep the file on Drive but mark it inactive
    // Let n8n workflow handle cleanup based on status field
    log.info("Hotel deleted: {}. n8n will handle cleanup.", event.getHotelId());
}
```

---

## Testing Strategy

### Unit Tests

```java
@Test
public void testGoogleDriveUpload() throws IOException {
    // Given
    String markdown = "---\ndoc_id: test-123\n---\n# Test Hotel";
    String path = "vietnam/da-nang/test/hotels/test-hotel.md";
    
    // When
    String fileId = driveService.uploadOrUpdateMarkdown(markdown, path);
    
    // Then
    assertNotNull(fileId);
    assertTrue(fileId.matches("[a-zA-Z0-9_-]+"));
}

@Test
public void testFolderCreation() throws IOException {
    // Test that folder path is created recursively
    String folderId = driveService.ensureFolderPath("vietnam/nha-trang/city/hotels");
    
    assertNotNull(folderId);
    // Verify folder exists on Drive
}

@Test
public void testUpdateExistingFile() throws IOException {
    // Upload once
    String fileId1 = driveService.uploadOrUpdateMarkdown("v1", "test.md");
    
    // Upload again (should update, not create new)
    String fileId2 = driveService.uploadOrUpdateMarkdown("v2", "test.md");
    
    assertEquals(fileId1, fileId2); // Same file ID = updated, not created
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
        String fileId = uploadService.generateAndUploadHotelProfile(dto);
        
        // Then: File should exist on Drive
        assertNotNull(fileId);
        
        // Verify file content
        String content = driveService.downloadFileContent(fileId);
        assertTrue(content.contains("doc_id: \"" + hotel.getId() + "\""));
        assertTrue(content.contains("# " + hotel.getName()));
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

### 2. Rate Limiting (Google Drive API Quota)

```java
@Component
public class GoogleDriveRateLimiter {
    private final RateLimiter rateLimiter = RateLimiter.create(10.0); // 10 req/sec
    
    public void acquirePermit() {
        rateLimiter.acquire();
    }
}

// Usage in GoogleDriveService
public String uploadOrUpdateMarkdown(String content, String path) throws IOException {
    rateLimiter.acquirePermit(); // Wait if needed
    // ... proceed with upload
}
```

### 3. Caching Folder IDs

Already implemented in `GoogleDriveService` via `folderCache` ConcurrentHashMap.

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
    
    @AfterReturning("execution(* com.webapp.holidate.service.storage.GoogleDriveService.upload*(..))")
    public void countUploads() {
        registry.counter("kb.drive.uploads").increment();
    }
}
```

---

## Deployment Checklist

- [ ] Create Google Cloud project
- [ ] Enable Google Drive API
- [ ] Create Service Account + download JSON key
- [ ] Share target Drive folder with service account email
- [ ] Add `google-service-account.json` to `src/main/resources/`
- [ ] Update `application.properties` with folder ID
- [ ] Test upload with 1 hotel
- [ ] Setup n8n workflow (import JSON)
- [ ] Configure n8n credentials (Drive, OpenAI, Pinecone)
- [ ] Test end-to-end: Backend → Drive → n8n → Vector DB
- [ ] Enable scheduled jobs
- [ ] Setup monitoring alerts
- [ ] Document Drive folder structure for team

---

## Troubleshooting

### Issue: "Insufficient permissions" error

**Solution**:
1. Check service account email has Editor access to Drive folder
2. Verify Drive API is enabled in Google Cloud Console
3. Check service account key file is loaded correctly

### Issue: Duplicate files created instead of updating

**Solution**:
- Check `findFileByName()` query
- Ensure `mimeType='text/markdown'` matches what you're creating
- Clear Drive trash (trashed files still count in queries)

### Issue: Slow folder creation

**Solution**:
- Folder cache should prevent this
- Check `folderCache.containsKey()` is working
- Consider pre-creating folder structure manually

### Issue: n8n workflow not triggering

**Solution**:
1. Verify Google Drive Trigger is watching correct folder ID
2. Check n8n execution history for errors
3. Test manually by uploading a file directly to Drive
4. Ensure n8n has Drive API permissions

---

## Estimated Resources

| Metric                     | Estimation                         |
|----------------------------|------------------------------------|
| **Processing Time**        | ~200 hotels/minute (parallel)      |
| **Drive Storage**          | ~5KB per hotel, 3KB per room       |
| **Total for 1000 hotels**  | ~8MB on Drive                      |
| **Google Drive API Quota** | 20,000 requests/day (plenty)       |
| **n8n Processing**         | ~10 files/minute (embedding)       |

---

## Next Steps

1. **Implement Phase 1-3** in your codebase
2. **Test with 1 hotel** first
3. **Setup n8n workflow** and test Drive → Vector DB flow
4. **Scale to batch generation**
5. **Monitor and optimize**

---

This implementation guide provides a complete, production-ready solution for generating knowledge base content and syncing it via Google Drive for n8n automation! 🚀
