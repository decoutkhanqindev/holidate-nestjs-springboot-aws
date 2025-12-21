package com.webapp.holidate.service.knowledgebase;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.webapp.holidate.dto.knowledgebase.BatchResult;
import com.webapp.holidate.dto.knowledgebase.HotelKnowledgeBaseDto;
import com.webapp.holidate.dto.knowledgebase.RoomKnowledgeBaseDto;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.repository.knowledgebase.KnowledgeBaseRepository;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
    private final KnowledgeBaseRepository repository;
    
    private static final int PROGRESS_LOG_INTERVAL = 50; // Log progress every 50 hotels
    
    /**
     * Process a batch of hotels for Knowledge Base generation and upload.
     * 
     * Error Isolation: Each hotel is wrapped in a try-catch block. If one hotel fails,
     * the error is logged (ERROR level) and processing continues with the next hotel.
     * 
     * Note: This method does not use @Transactional to avoid connection leak warnings
     * when processing large batches. Each database operation manages its own transaction.
     * 
     * @param hotels List of hotels to process
     * @return BatchResult containing success/failure counts and failed hotel IDs
     */
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
        
        // Load collections (amenities, entertainment venues, rooms) separately to avoid cartesian product
        // This ensures all data is available for DTO generation
        loadHotelCollections(hotels);
        
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
                        // Build Room Knowledge Base DTO
                        RoomKnowledgeBaseDto roomDto = generationService.buildRoomKB(room);
                        
                        // Generate and upload room detail
                        uploadService.generateAndUploadRoomDetail(roomDto);
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
    
    /**
     * Load hotel collections (amenities, entertainment venues, rooms) separately.
     * This is necessary because findAllActiveHotelsForKnowledgeBase doesn't fetch collections
     * to avoid cartesian product issues.
     * 
     * @param hotels List of hotels to load collections for
     */
    private void loadHotelCollections(List<Hotel> hotels) {
        if (hotels == null || hotels.isEmpty()) {
            return;
        }
        
        List<String> hotelIds = hotels.stream()
                .map(Hotel::getId)
                .collect(Collectors.toList());
        
        String activeStatus = AccommodationStatusType.ACTIVE.getValue();
        
        // Load amenities
        List<Hotel> hotelsWithAmenities = repository.findHotelsWithAmenities(hotelIds);
        mergeAmenities(hotels, hotelsWithAmenities);
        
        // Load entertainment venues (for nearby_venues)
        List<Hotel> hotelsWithVenues = repository.findHotelsWithEntertainmentVenues(hotelIds);
        mergeEntertainmentVenues(hotels, hotelsWithVenues);
        
        // Load rooms
        List<Room> rooms = repository.findRoomsByHotelIds(hotelIds, activeStatus);
        mergeRooms(hotels, rooms);
        
        // Load hotel photos
        List<Hotel> hotelsWithPhotos = repository.findHotelsWithPhotos(hotelIds);
        mergePhotos(hotels, hotelsWithPhotos);
        
        // Load room photos
        List<Room> roomsWithPhotos = repository.findRoomsWithPhotos(hotelIds, activeStatus);
        mergeRoomPhotos(rooms, roomsWithPhotos);
        
        log.debug("Loaded collections for {} hotels: amenities, venues, rooms, photos", hotels.size());
    }
    
    /**
     * Merge amenities from loaded hotels into the main hotel list.
     */
    private void mergeAmenities(List<Hotel> hotels, List<Hotel> hotelsWithAmenities) {
        if (hotelsWithAmenities == null || hotelsWithAmenities.isEmpty()) {
            return;
        }
        
        for (Hotel hotel : hotels) {
            hotelsWithAmenities.stream()
                    .filter(h -> h.getId().equals(hotel.getId()))
                    .findFirst()
                    .ifPresent(h -> hotel.setAmenities(h.getAmenities()));
        }
    }
    
    /**
     * Merge entertainment venues from loaded hotels into the main hotel list.
     */
    private void mergeEntertainmentVenues(List<Hotel> hotels, List<Hotel> hotelsWithVenues) {
        if (hotelsWithVenues == null || hotelsWithVenues.isEmpty()) {
            return;
        }
        
        for (Hotel hotel : hotels) {
            hotelsWithVenues.stream()
                    .filter(h -> h.getId().equals(hotel.getId()))
                    .findFirst()
                    .ifPresent(h -> hotel.setEntertainmentVenues(h.getEntertainmentVenues()));
        }
    }
    
    /**
     * Merge rooms from loaded list into the main hotel list.
     * Ensures all hotels have a rooms collection (at least empty set) to avoid LazyInitializationException.
     */
    private void mergeRooms(List<Hotel> hotels, List<Room> rooms) {
        for (Hotel hotel : hotels) {
            if (rooms == null || rooms.isEmpty()) {
                // Ensure hotel has an empty set to avoid lazy loading issues
                hotel.setRooms(new HashSet<>());
                continue;
            }
            
            Set<Room> hotelRooms = rooms.stream()
                    .filter(room -> room.getHotel() != null && room.getHotel().getId().equals(hotel.getId()))
                    .collect(Collectors.toSet());
            
            // Always set rooms, even if empty, to ensure collection is initialized
            hotel.setRooms(hotelRooms);
        }
    }
    
    /**
     * Merge photos from loaded hotels into the main hotel list.
     */
    private void mergePhotos(List<Hotel> hotels, List<Hotel> hotelsWithPhotos) {
        if (hotelsWithPhotos == null || hotelsWithPhotos.isEmpty()) {
            return;
        }
        
        for (Hotel hotel : hotels) {
            hotelsWithPhotos.stream()
                    .filter(h -> h.getId().equals(hotel.getId()))
                    .findFirst()
                    .ifPresent(h -> hotel.setPhotos(h.getPhotos()));
        }
    }
    
    /**
     * Merge room photos from loaded rooms into the main room list.
     */
    private void mergeRoomPhotos(List<Room> rooms, List<Room> roomsWithPhotos) {
        if (roomsWithPhotos == null || roomsWithPhotos.isEmpty() || rooms == null || rooms.isEmpty()) {
            return;
        }
        
        for (Room room : rooms) {
            roomsWithPhotos.stream()
                    .filter(r -> r.getId().equals(room.getId()))
                    .findFirst()
                    .ifPresent(r -> room.setPhotos(r.getPhotos()));
        }
    }
}

