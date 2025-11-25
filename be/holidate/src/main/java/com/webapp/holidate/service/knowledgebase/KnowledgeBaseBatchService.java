package com.webapp.holidate.service.knowledgebase;

import com.webapp.holidate.dto.knowledgebase.BatchResult;
import com.webapp.holidate.dto.knowledgebase.HotelKnowledgeBaseDto;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Service for batch processing of Knowledge Base generation and upload.
 * 
 * This service handles:
 * - Iterating through lists of hotels
 * - Error isolation (one hotel failure doesn't stop the batch)
 * - Progress logging
 * - Result aggregation
 * 
 * Key Features:
 * - Each hotel is processed in a try-catch block to ensure error isolation
 * - Failed hotels are logged and tracked but don't stop the batch
 * - Progress is logged at regular intervals
 * - Returns comprehensive BatchResult with success/failure statistics
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeBaseBatchService {
    
    private final KnowledgeBaseGenerationService generationService;
    private final KnowledgeBaseUploadService uploadService;
    
    private static final int PROGRESS_LOG_INTERVAL = 50; // Log progress every 50 hotels
    
    /**
     * Process a batch of hotels for Knowledge Base generation and upload.
     * 
     * Error Isolation: Each hotel is wrapped in a try-catch block. If one hotel fails,
     * the error is logged (ERROR level) and processing continues with the next hotel.
     * 
     * @param hotels List of hotels to process
     * @return BatchResult containing success/failure counts and failed hotel IDs
     */
    @Transactional(readOnly = true)
    public BatchResult processBatch(List<Hotel> hotels) {
        if (hotels == null || hotels.isEmpty()) {
            log.info("Batch processing: Empty hotel list provided");
            return BatchResult.builder()
                    .totalCount(0)
                    .successCount(0)
                    .failureCount(0)
                    .failedHotelIds(new ArrayList<>())
                    .startTime(LocalDateTime.now())
                    .endTime(LocalDateTime.now())
                    .durationMillis(0)
                    .build();
        }
        
        LocalDateTime startTime = LocalDateTime.now();
        log.info("Starting batch processing for {} hotels", hotels.size());
        
        BatchResult.BatchResultBuilder resultBuilder = BatchResult.builder()
                .totalCount(hotels.size())
                .startTime(startTime)
                .failedHotelIds(new ArrayList<>());
        
        int successCount = 0;
        int failureCount = 0;
        List<String> failedHotelIds = new ArrayList<>();
        
        for (int i = 0; i < hotels.size(); i++) {
            Hotel hotel = hotels.get(i);
            int currentIndex = i + 1;
            
            // Log progress at intervals
            if (currentIndex % PROGRESS_LOG_INTERVAL == 0 || currentIndex == hotels.size()) {
                log.info("Batch progress: Processed {}/{} hotels (Success: {}, Failed: {})", 
                        currentIndex, hotels.size(), successCount, failureCount);
            }
            
            try {
                processHotel(hotel);
                successCount++;
                
                if (currentIndex % 10 == 0) {
                    log.debug("Successfully processed hotel {}: {} ({})", 
                            currentIndex, hotel.getName(), hotel.getId());
                }
                
            } catch (Exception e) {
                failureCount++;
                String hotelId = hotel.getId();
                String hotelName = hotel.getName();
                
                failedHotelIds.add(hotelId);
                
                log.error("Failed to process hotel [{}] {} (ID: {}): {}", 
                        currentIndex, hotelName, hotelId, e.getMessage(), e);
            }
        }
        
        LocalDateTime endTime = LocalDateTime.now();
        BatchResult result = resultBuilder
                .successCount(successCount)
                .failureCount(failureCount)
                .failedHotelIds(failedHotelIds)
                .endTime(endTime)
                .build();
        result.calculateDuration();
        
        log.info("Batch processing completed: Total={}, Success={}, Failed={}, Duration={}ms", 
                result.getTotalCount(), result.getSuccessCount(), result.getFailureCount(), 
                result.getDurationMillis());
        
        if (failureCount > 0) {
            log.warn("Failed hotel IDs: {}", result.getFailedHotelIds());
        }
        
        return result;
    }
    
    /**
     * Process a single hotel: generate DTO, upload profile, and process rooms.
     * 
     * @param hotel Hotel to process
     * @throws Exception if any step fails
     */
    private void processHotel(Hotel hotel) throws Exception {
        String hotelId = hotel.getId();
        String hotelName = hotel.getName();
        
        log.debug("Processing hotel: {} ({})", hotelName, hotelId);
        
        // Step 1: Build Knowledge Base DTO
        HotelKnowledgeBaseDto dto = generationService.buildHotelKB(hotel);
        
        // Step 2: Generate and upload hotel profile
        String s3Key = uploadService.generateAndUploadHotelProfile(dto);
        log.debug("Uploaded hotel profile to S3: {} → {}", hotelName, s3Key);
        
        // Step 3: Process active rooms
        Set<Room> rooms = hotel.getRooms();
        if (rooms != null && !rooms.isEmpty()) {
            String activeStatus = AccommodationStatusType.ACTIVE.getValue();
            int roomCount = 0;
            
            for (Room room : rooms) {
                if (activeStatus.equalsIgnoreCase(room.getStatus())) {
                    try {
                        // Note: Room detail upload is not yet implemented in uploadService
                        // This is a placeholder for future implementation
                        // uploadService.generateAndUploadRoomDetail(roomDto);
                        roomCount++;
                    } catch (Exception e) {
                        log.warn("Failed to process room {} for hotel {}: {}", 
                                room.getName(), hotelName, e.getMessage());
                        // Continue processing other rooms - don't fail the entire hotel
                    }
                }
            }
            
            if (roomCount > 0) {
                log.debug("Processed {} active rooms for hotel: {}", roomCount, hotelName);
            }
        }
    }
}

