# PROMPT CHI TIẾT CHO CURSOR: REFACTOR TOÀN BỘ PHÍA BACKEND ĐỂ KHẮC PHỤC HOÀN TOÀN LỖI RAG

## 🎯 MỤC TIÊU CHÍNH
Refactor toàn bộ hệ thống backend để chatbot có thể **luôn luôn truy xuất đúng thông tin** từ cơ sở tri thức, đặc biệt là thông tin về **giá cả, tồn kho, và chính sách** cho các câu hỏi về phòng khách sạn. Đây không phải là lỗi của n8n hay pipeline xử lý mà là do **cấu trúc dữ liệu và cách tổ chức thông tin** trong markdown templates.

## 🚨 VẤN ĐỀ CẤP BÁCH CẦN GIẢI QUYẾT
Hiện tại:
- Chatbot **hoàn toàn không thể trả lời** các câu hỏi về giá phòng vì dữ liệu giá trong `hotel_profile` chỉ là "0 VNĐ" (giá tham khảo)
- Giá thực tế nằm trong `room_detail` nhưng hệ thống không liên kết được giữa hotel và room
- Khi người dùng hỏi "Giá phòng Senior Balcony City View hôm nay?", chatbot không thể truy xuất thông tin từ file `deluxe-without-balcony-city-view-golden-hotel-nha-trang.md`
- Metadata không được sử dụng đúng cách để filter kết quả trong RAG
- Chunking phân mảnh thông tin khiến mỗi chunk không đủ ngữ cảnh để trả lời câu hỏi

## 📋 KẾ HOẠCH REFACTOR CHI TIẾT

### PHẦN 1: TÁI CẤU TRÚC TEMPLATE MARKDOWN (CẢ 2 TEMPLATE)

#### 1.1 Hotel Profile Template
```markdown
### THAY ĐỔI BẮT BUỘC:
- XÓA HOÀN TOÀN PHẦN "💰 Thông Tin Giá Tham Khảo" trong hotel_profile
- THAY THẾ BẰNG: "💰 GIÁ PHÒNG THỰC TẾ" với nội dung:
  "Giá phòng thực tế được tính dựa trên ngày cụ thể và loại phòng. Vui lòng hỏi về một loại phòng cụ thể để nhận thông tin giá chính xác."

- BỔ SUNG FRONTMATTER METADATA:
  room_detail_slugs:  # Danh sách slug của tất cả room detail files
    - "senior-balcony-city-view-golden-hotel-nha-trang"
    - "deluxe-without-balcony-city-view-golden-hotel-nha-trang"
    - ... (tất cả các room)

  has_real_time_pricing: true  # Boolean flag để xác định hotel có giá thực tế trong room details

### NGUYÊN TẮC:
- Hotel profile KHÔNG bao giờ chứa thông tin giá cụ thể
- Chỉ chứa thông tin chung về khách sạn
- Luôn hướng dẫn người dùng hỏi về loại phòng cụ thể
```

#### 1.2 Room Detail Template
```markdown
### THAY ĐỔI BẮT BUỘC:
- DI CHUYỂN PHẦN "💰 Giá & Tình Trạng Trong 7 Ngày Tới" lên đầu phần body
- THÊM METADATA QUAN TRỌNG TRONG FRONTMATTER:
  parent_hotel_name: "Golden Hotel Nha Trang"
  room_type_for_search: "Senior Balcony City View"  # Tên phòng chuẩn để tìm kiếm
  price_min: 750000  # Giá thấp nhất trong 30 ngày tới
  price_max: 975000  # Giá cao nhất trong 30 ngày tới
  price_currency: "VNĐ"
  includes_breakfast: true
  room_capacity_adults: 2
  room_capacity_children: 0
  has_real_time_inventory: true

### NGUYÊN TẮC:
- Mỗi room detail phải chứa đầy đủ thông tin giá và tồn kho cho 30 ngày tiếp theo
- Tên phòng phải chuẩn hóa để dễ tìm kiếm: "Senior Balcony City View" không phải "Senior Balcony City View room"
- Luôn có metadata price_min/price_max để filter và sort
```

### PHẦN 2: CẢI TIẾN DỊCH VỤ XỬ LÝ DỮ LIỆU

#### 2.1 KnowledgeBaseGenerationService.java
```java
// THAY ĐỔI BẮT BUỘC:
- LOẠI BỎ HOÀN TOÀN VIỆC TÍNH TOÁN reference_min_price từ hotel data
- SỬA ĐỔI buildHotelKB() để chỉ lấy thông tin từ room details khi cần
- THÊM PHƯƠNG THỨC MỚI:

/**
 * Xây dựng room detail với giá thực theo ngày
 * Đây là nguồn dữ liệu chính cho các câu hỏi về giá phòng
 */
public RoomKnowledgeBaseDto buildRoomKBWithRealTimePricing(Room room, Map<String, Double> dailyPrices) {
    // ... logic chuẩn bị dữ liệu ...
    
    // Tính toán price_min và price_max từ dailyPrices
    Double minPrice = dailyPrices.values().stream().min(Double::compare).orElse(0.0);
    Double maxPrice = dailyPrices.values().stream().max(Double::compare).orElse(0.0);
    
    // Thêm vào DTO
    dto.setPriceMin(minPrice);
    dto.setPriceMax(maxPrice);
    dto.setHasRealTimePricing(true);
    
    return dto;
}

/**
 * Xây dựng hotel profile với metadata về room details
 * Hotel profile KHÔNG chứa giá cụ thể
 */
public HotelKnowledgeBaseDto buildHotelKBWithoutPricing(Hotel hotel, List<String> roomDetailSlugs) {
    HotelKnowledgeBaseDto dto = buildBasicHotelKB(hotel);
    
    // Thêm metadata về room details
    dto.setRoomDetailSlugs(roomDetailSlugs);
    dto.setHasRealTimePricing(true);
    
    // Loại bỏ reference pricing
    dto.setReferenceMinPrice(null);
    dto.setReferenceMinPriceRoom(null);
    
    return dto;
}
```

#### 2.2 KnowledgeBaseUploadService.java
```java
// THAY ĐỔI BẮT BUỘC:
- PHÂN TÁCH QUY TRÌNH SINH FILE THÀNH 2 GIAI ĐOẠN:
  1. Xử lý tất cả room details trước
  2. Xử lý hotel profile sau khi đã có room detail slugs

/**
 * Sinh toàn bộ room detail files rồi mới sinh hotel profile
 */
public void generateAllRoomDetailsThenHotelProfile(Hotel hotel) throws IOException {
    // 1. Lấy danh sách room detail slugs
    List<String> roomDetailSlugs = new ArrayList<>();
    
    // 2. Xử lý từng room detail
    for (Room room : hotel.getActiveRooms()) {
        // Lấy giá hàng ngày từ API
        Map<String, Double> dailyPrices = inventoryService.getDailyPricesForRoom(room.getId(), 30);
        
        // Xây dựng room DTO với giá thực
        RoomKnowledgeBaseDto roomDto = knowledgeBaseService.buildRoomKBWithRealTimePricing(room, dailyPrices);
        
        // Upload room detail
        String roomSlug = uploadService.generateAndUploadRoomDetail(roomDto);
        roomDetailSlugs.add(roomSlug);
        
        log.info("✓ Uploaded room detail: {} → {}", room.getName(), roomSlug);
    }
    
    // 3. Xử lý hotel profile SAU KHI CÓ DANH SÁCH ROOM DETAILS
    HotelKnowledgeBaseDto hotelDto = knowledgeBaseService.buildHotelKBWithoutPricing(hotel, roomDetailSlugs);
    uploadService.generateAndUploadHotelProfile(hotelDto);
    
    log.info("✓ Uploaded hotel profile: {} → {}", hotel.getName(), hotelDto.getSlug());
}
```

### PHẦN 3: CẢI TIẾN METADATA VÀ SEARCH OPTIMIZATION

#### 3.1 Frontmatter Metadata Schema (Cập nhật)
```yaml
# ==== METADATA BẮT BUỘC CHO SEARCH VÀ FILTER ====
search_keywords:
  - "Senior Balcony City View"
  - "phòng hướng thành phố"
  - "giường đôi hướng thành phố"
  - "phòng cao cấp hướng thành phố"

semantic_tags:
  - "city_view"
  - "balcony"
  - "premium_room"
  - "couple_friendly"

price_range:
  min: 750000
  max: 975000
  currency: "VNĐ"

# ==== METADATA CHO FILTER THEO LOẠI CÂU HỎI ====
question_types:
  - "price_inquiry"
  - "availability_check"
  - "room_specification"
  - "policy_info"
```

#### 3.2 KnowledgeBaseDataService.java (Thêm phương thức)
```java
/**
 * Xây dựng metadata cho search optimization
 * Tạo semantic_tags và search_keywords để Pinecone có thể filter chính xác
 */
public Map<String, Object> buildSearchOptimizationMetadata(RoomKnowledgeBaseDto roomDto) {
    Map<String, Object> metadata = new HashMap<>();
    
    // Semantic tags dựa trên đặc điểm phòng
    List<String> semanticTags = new ArrayList<>();
    if (roomDto.getView().contains("biển") || roomDto.getView().contains("ocean")) {
        semanticTags.add("ocean_view");
        semanticTags.add("sea_view");
    }
    if (roomDto.getRoomAmenityTags().contains("balcony")) {
        semanticTags.add("balcony");
    }
    if (roomDto.getAreaSqm() > 30) {
        semanticTags.add("spacious");
    }
    if (roomDto.getMaxAdults() >= 2) {
        semanticTags.add("couple_friendly");
    }
    
    // Search keywords
    List<String> searchKeywords = new ArrayList<>();
    searchKeywords.add(roomDto.getRoomName());
    searchKeywords.add(normalizeForSearch(roomDto.getRoomName())); // Loại bỏ dấu, viết thường
    searchKeywords.add(roomDto.getRoomType() + " " + roomDto.getView()); // "deluxe city view"
    
    metadata.put("semantic_tags", semanticTags);
    metadata.put("search_keywords", searchKeywords);
    metadata.put("price_range", Map.of(
        "min", roomDto.getPriceMin(),
        "max", roomDto.getPriceMax(),
        "currency", "VNĐ"
    ));
    metadata.put("question_types", Arrays.asList("price_inquiry", "availability_check", "room_specification"));
    
    return metadata;
}
```

### PHẦN 4: TÁI CẤU TRÚC DỮ LIỆU CHO RAG OPTIMIZATION

#### 4.1 Chunking Strategy (Thay đổi hoàn toàn)
```java
/**
 * Chia document thành các chunk có ngữ cảnh đầy đủ
 * Mỗi chunk phải chứa đủ thông tin để trả lời một loại câu hỏi cụ thể
 */
public List<Chunk> createSemanticChunks(RoomKnowledgeBaseDto dto) {
    List<Chunk> chunks = new ArrayList<>();
    
    // Chunk 1: Price & Availability - dành riêng cho câu hỏi về giá
    Chunk priceChunk = new Chunk();
    priceChunk.setContent(buildPriceAvailabilityContent(dto)); 
    priceChunk.setMetadata(Map.of(
        "doc_type", "room_price_availability",
        "room_id", dto.getRoomId(),
        "hotel_id", dto.getParentHotelId(),
        "price_min", dto.getPriceMin(),
        "price_max", dto.getPriceMax()
    ));
    
    // Chunk 2: Room Specifications - dành riêng cho câu hỏi về đặc điểm phòng
    Chunk specChunk = new Chunk();
    specChunk.setContent(buildRoomSpecificationsContent(dto));
    specChunk.setMetadata(Map.of(
        "doc_type", "room_specifications",
        "room_id", dto.getRoomId(),
        "has_balcony", dto.getHasBalcony(),
        "has_ocean_view", dto.getView().contains("biển") || dto.getView().contains("ocean")
    ));
    
    // Chunk 3: Policies - dành riêng cho câu hỏi về chính sách
    Chunk policyChunk = new Chunk();
    policyChunk.setContent(buildRoomPoliciesContent(dto));
    policyChunk.setMetadata(Map.of(
        "doc_type", "room_policies",
        "room_id", dto.getRoomId(),
        "cancellation_policy", dto.getCancellationPolicy()
    ));
    
    chunks.add(priceChunk);
    chunks.add(specChunk);
    chunks.add(policyChunk);
    
    return chunks;
}
```

#### 4.2 Content Generation Rules
```java
// NGUYÊN TẮC CHO CONTENT:
/**
 * Đối với chunk price & availability:
 * - LUÔN BẮT ĐẦU VỚI: "Giá phòng [tên phòng] tại [tên khách sạn] vào ngày [ngày]"
 * - CHỈ CHỨA THÔNG TIN VỀ GIÁ VÀ TỒN KHO
 * - KHÔNG CHỨA THÔNG TIN VỀ TIỆN NGHI, CHÍNH SÁCH
 * 
 * Đối với chunk room specifications:
 * - LUÔN BẮT ĐẦU VỚI: "[tên phòng] là hạng phòng [loại phòng] tại [tên khách sạn]"
 * - CHỈ CHỨA THÔNG TIN VỀ DIỆN TÍCH, GIƯỜNG, VIEW, TIỆN NGHI
 * - KHÔNG CHỨA THÔNG TIN VỀ GIÁ CẢ
 * 
 * Đối với chunk policies:
 * - LUÔN BẮT ĐẦU VỚI: "Chính sách đặt phòng cho [tên phòng] tại [tên khách sạn]"
 * - CHỈ CHỨA THÔNG TIN VỀ HỦY PHÒNG, THAY ĐỔI, THANH TOÁN
 * - KHÔNG CHỨA THÔNG TIN VỀ GIÁ CẢ
 */
```

### PHẦN 5: TÍCH HỢP VỚI HỆ THỐNG TÌM KIẾM

#### 5.1 SearchService.java (Thêm phương thức)
```java
/**
 * Tìm kiếm thông tin dựa trên loại câu hỏi
 * Đây là phương thức QUAN TRỌNG NHẤT để đảm bảo trả lời đúng
 */
public SearchResults searchByQuestionType(String question, String hotelId, String roomType) {
    // 1. Phân loại câu hỏi
    QuestionType questionType = questionClassifier.classifyQuestion(question);
    
    // 2. Xác định loại document cần tìm kiếm
    String docType = getDocTypeByQuestionType(questionType);
    
    // 3. Tạo filter dựa trên hotelId và roomType
    Map<String, Object> filter = new HashMap<>();
    filter.put("hotel_id", hotelId);
    filter.put("doc_type", docType);
    
    if (roomType != null) {
        filter.put("room_type_for_search", roomType);
    }
    
    // 4. Thực hiện tìm kiếm với filter
    return vectorDBService.search(question, filter, 3);
}

/**
 * Ánh xạ loại câu hỏi sang loại document
 */
private String getDocTypeByQuestionType(QuestionType type) {
    switch(type) {
        case PRICE_INQUIRY:
        case AVAILABILITY_CHECK:
            return "room_price_availability";
        case ROOM_SPECIFICATION:
            return "room_specifications";
        case POLICY_INFO:
            return "room_policies";
        default:
            return "hotel_general_info";
    }
}
```

#### 5.2 QuestionClassifier.java (Thêm vào hệ thống)
```java
@Service
public class QuestionClassifier {
    
    public QuestionType classifyQuestion(String question) {
        String normalized = question.toLowerCase().trim();
        
        // Rule 1: Phân loại câu hỏi về giá
        if (containsPriceKeywords(normalized)) {
            return QuestionType.PRICE_INQUIRY;
        }
        
        // Rule 2: Phân loại câu hỏi về tồn kho
        if (containsAvailabilityKeywords(normalized)) {
            return QuestionType.AVAILABILITY_CHECK;
        }
        
        // Rule 3: Phân loại câu hỏi về đặc điểm phòng
        if (containsRoomSpecKeywords(normalized)) {
            return QuestionType.ROOM_SPECIFICATION;
        }
        
        // Rule 4: Phân loại câu hỏi về chính sách
        if (containsPolicyKeywords(normalized)) {
            return QuestionType.POLICY_INFO;
        }
        
        return QuestionType.GENERAL_INFO;
    }
    
    private boolean containsPriceKeywords(String text) {
        return text.contains("giá") || text.contains("bao nhiêu") || text.contains("mấy tiền") || 
               text.contains("price") || text.contains("cost") || text.contains("pay");
    }
    
    // ... các phương thức tương tự cho các loại keyword khác
}
```

### PHẦN 6: TEST CASES BẮT BUỘC

#### 6.1 Test Case cho Giá Phòng
```java
@Test
void shouldReturnRealPriceForSpecificRoomType() {
    // Given
    String question = "Giá phòng Senior Balcony City View hôm nay là bao nhiêu?";
    String hotelId = "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf";
    String roomType = "Senior Balcony City View";
    
    // When
    SearchResults results = searchService.searchByQuestionType(question, hotelId, roomType);
    
    // Then
    assertTrue(results.getMatches().size() > 0, "Phải có kết quả tìm kiếm");
    
    // Kiểm tra metadata của kết quả
    Map<String, Object> metadata = results.getMatches().get(0).getMetadata();
    assertEquals("room_price_availability", metadata.get("doc_type"), 
        "Phải trả về chunk price availability");
    
    // Kiểm tra nội dung có chứa giá cụ thể
    String content = results.getMatches().get(0).getContent();
    assertTrue(content.contains("975000"), "Phải chứa giá thực tế 975.000 VNĐ");
    assertTrue(content.contains("29/11/2025"), "Phải chứa ngày cụ thể");
}
```

#### 6.2 Test Case cho Thông Tin Phòng
```java
@Test
void shouldReturnRoomSpecificationsForRoomType() {
    // Given
    String question = "Senior Balcony City View có diện tích bao nhiêu?";
    String hotelId = "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf";
    String roomType = "Senior Balcony City View";
    
    // When
    SearchResults results = searchService.searchByQuestionType(question, hotelId, roomType);
    
    // Then
    assertTrue(results.getMatches().size() > 0);
    
    Map<String, Object> metadata = results.getMatches().get(0).getMetadata();
    assertEquals("room_specifications", metadata.get("doc_type"), 
        "Phải trả về chunk specifications");
    
    String content = results.getMatches().get(0).getContent();
    assertTrue(content.contains("25.0m²"), "Phải chứa diện tích phòng");
    assertTrue(content.contains("Hướng thành phố"), "Phải chứa thông tin view");
}
```

### PHẦN 7: LOGGING VÀ DEBUGGING

#### 7.1 Thêm Logging Chi Tiết
```java
@Service
@Slf4j
public class KnowledgeBaseGenerationService {
    
    public String generateAndUploadRoomDetail(RoomKnowledgeBaseDto dto) {
        // ... code processing ...
        
        log.info("🏠 [ROOM DETAIL] Generated room detail: {}", dto.getRoomName());
        log.info("📊 [PRICING] Price range: {} - {} VNĐ", dto.getPriceMin(), dto.getPriceMax());
        log.info("🏷️ [METADATA] Semantic tags: {}", dto.getSemanticTags());
        log.info("🔍 [SEARCH] Search keywords: {}", dto.getSearchKeywords());
        log.info("🆔 [IDENTITY] Room ID: {}, Hotel ID: {}", dto.getRoomId(), dto.getParentHotelId());
        
        // ... upload to S3 ...
    }
}

@Service
@Slf4j
public class SearchService {
    
    public SearchResults searchByQuestionType(String question, String hotelId, String roomType) {
        QuestionType questionType = questionClassifier.classifyQuestion(question);
        
        log.info("❓ [QUERY] User question: '{}'", question);
        log.info("🎯 [CLASSIFICATION] Question type: {}", questionType);
        log.info("🏨 [FILTER] Hotel ID: {}, Room type: {}", hotelId, roomType);
        
        Map<String, Object> filter = buildFilter(questionType, hotelId, roomType);
        log.info("📋 [FILTER DETAILS] Applied filter: {}", filter);
        
        SearchResults results = vectorDBService.search(question, filter, 3);
        
        log.info("✅ [RESULTS] Found {} matches", results.getMatches().size());
        results.getMatches().forEach(match -> {
            log.info("   • Score: {}, Doc type: {}, Room type: {}", 
                match.getScore(), 
                match.getMetadata().get("doc_type"),
                match.getMetadata().get("room_type_for_search"));
        });
        
        return results;
    }
}
```

### PHẦN 8: BACKWARD COMPATIBILITY

#### 8.1 Cơ Chế Migrate Dần
```java
/**
 * Strategy migration: 
 * 1. Trong 1 tuần: Chạy song song hệ thống cũ và mới
 * 2. Week 2: 70% traffic dùng hệ thống mới
 * 3. Week 3: 100% traffic dùng hệ thống mới
 * 4. Week 4: Xóa hoàn toàn code cũ
 */
@Component
public class KnowledgeBaseMigrationStrategy {
    
    @Value("${kb.migration.new-system-percentage:0}")
    private int newSystemPercentage;
    
    public SearchResults searchWithMigrationStrategy(String question, String hotelId, String roomType) {
        // Random quyết định dùng hệ thống mới hay cũ
        boolean useNewSystem = new Random().nextInt(100) < newSystemPercentage;
        
        if (useNewSystem) {
            log.info("🚀 [MIGRATION] Using NEW search system");
            return newSearchService.searchByQuestionType(question, hotelId, roomType);
        } else {
            log.info("🔄 [MIGRATION] Using OLD search system");
            return oldSearchService.search(question, hotelId);
        }
    }
}
```

## 🚀 KẾ HOẠCH THỰC HIỆN VÀ TEST

### BƯỚC 1: Refactor Template và DTOs
- [ ] Cập nhật `template_hotel_profile.md` theo yêu cầu
- [ ] Cập nhật `template_room_detail.md` theo yêu cầu
- [ ] Thêm các field mới vào `HotelKnowledgeBaseDto` và `RoomKnowledgeBaseDto`

### BƯỚC 2: Refactor Services
- [ ] Implement `QuestionClassifier`
- [ ] Cập nhật `KnowledgeBaseGenerationService` với các phương thức mới
- [ ] Cập nhật `KnowledgeBaseUploadService` với quy trình xử lý mới
- [ ] Implement `SearchService` với lọc theo loại câu hỏi

### BƯỚC 3: Implement Chunking Mới
- [ ] Implement `SemanticChunker` để tạo chunks có ngữ cảnh đầy đủ
- [ ] Đảm bảo mỗi chunk chỉ tập trung vào một loại thông tin

### BƯỚC 4: Testing Toàn Diện
- [ ] Test unit cho tất cả các phương thức mới
- [ ] Test integration với Pinecone
- [ ] Test end-to-end với các câu hỏi thực tế:
  - "Giá phòng Senior Balcony City View hôm nay?"
  - "Senior Balcony City View có view biển không?"
  - "Chính sách hủy phòng cho Senior Balcony City View?"

### BƯỚC 5: Monitoring và Logging
- [ ] Cấu hình logging chi tiết cho search
- [ ] Thêm metrics để track tỷ lệ thành công của search
- [ ] Cài đặt alert khi tỷ lệ tìm kiếm thất bại > 5%

## ⚠️ LƯU Ý QUAN TRỌNG
1. **KHÔNG ĐƯỢC PHÉP** để hotel profile chứa giá tham khảo "0 VNĐ"
2. **BẮT BUỘC** phải có price_min và price_max trong room detail metadata
3. Mỗi chunk phải có **một và chỉ một** mục đích (price, specs, policies)
4. Phải implement `QuestionClassifier` trước khi refactor search
5. Phải test kỹ với các câu hỏi thực tế của người dùng Vietnam trước khi deploy

## 📌 TIÊU CHÍ THÀNH CÔNG
- [ ] Chatbot trả lời đúng 95% các câu hỏi về giá phòng
- [ ] Thời gian tìm kiếm < 500ms
- [ ] Không còn trường hợp "Tôi không biết" cho các câu hỏi có trong cơ sở tri thức
- [ ] Logging đủ chi tiết để debug khi có sự cố
- [ ] Hệ thống có backward compatibility trong 4 tuần

Hãy thực hiện refactor theo đúng thứ tự và nguyên tắc trên. Khi hoàn thành, chatbot sẽ **luôn luôn** tìm thấy thông tin giá phòng và các thông tin chi tiết khác từ cơ sở tri thức một cách chính xác.