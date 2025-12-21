package com.webapp.holidate.controller;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.holidate.component.scheduler.KnowledgeBaseScheduler;
import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.endpoint.KnowledgeBaseEndpoints;
import com.webapp.holidate.dto.knowledgebase.BatchResult;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.repository.knowledgebase.KnowledgeBaseRepository;
import com.webapp.holidate.service.knowledgebase.KnowledgeBaseBatchService;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Admin controller for Knowledge Base synchronization operations.
 * 
 * Provides manual trigger endpoints for:
 * - Full sync (all active hotels)
 * - Incremental sync (modified hotels)
 * - Single hotel sync (for debugging)
 * 
 * Security: All endpoints require ADMIN role (enforced by SecurityConfig).
 */
@Slf4j
@RestController
@RequestMapping(KnowledgeBaseEndpoints.ADMIN_KB)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AdminKnowledgeBaseController {
    
    KnowledgeBaseRepository repository;
    KnowledgeBaseBatchService batchService;
    KnowledgeBaseScheduler scheduler;
    ApplicationContext applicationContext;
    
    // Get self proxy from ApplicationContext to enable @Async
    private AdminKnowledgeBaseController getSelf() {
        return applicationContext.getBean(AdminKnowledgeBaseController.class);
    }
    
    /**
     * Trigger full synchronization of all active hotels.
     * This operation runs asynchronously to avoid blocking the HTTP request.
     * 
     * @return Response indicating the sync has been triggered
     */
    @PostMapping(KnowledgeBaseEndpoints.SYNC + KnowledgeBaseEndpoints.FULL)
    public ApiResponse<String> triggerFullSync() {
        log.info("Admin triggered full Knowledge Base sync");
        
        // Run asynchronously to avoid blocking - use proxy from ApplicationContext to enable @Async
        getSelf().triggerFullSyncAsync();
        
        return ApiResponse.<String>builder()
                .data("Full sync triggered successfully. Processing in background.")
                .message("Full sync started")
                .build();
    }
    
    /**
     * Asynchronous method to execute full sync.
     */
    @Async
    public void triggerFullSyncAsync() {
        try {
            String activeStatus = AccommodationStatusType.ACTIVE.getValue();
            List<Hotel> hotels = repository.findAllActiveHotelsForKnowledgeBase(activeStatus);
            
            log.info("Full sync: Found {} active hotels", hotels.size());
            
            if (hotels.isEmpty()) {
                log.info("No active hotels found. Full sync skipped.");
                return;
            }
            
            BatchResult result = batchService.processBatch(hotels);
            
            log.info("Full sync completed: Total={}, Success={}, Failed={}, Duration={}ms", 
                    result.getTotalCount(), result.getSuccessCount(), 
                    result.getFailureCount(), result.getDurationMillis());
            
        } catch (Exception e) {
            log.error("Error during admin-triggered full sync: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Trigger incremental synchronization of modified hotels.
     * This operation runs asynchronously to avoid blocking the HTTP request.
     * 
     * @return Response indicating the sync has been triggered
     */
    @PostMapping(KnowledgeBaseEndpoints.SYNC + KnowledgeBaseEndpoints.INCREMENTAL)
    public ApiResponse<String> triggerIncrementalSync() {
        log.info("Admin triggered incremental Knowledge Base sync");
        
        // Run asynchronously to avoid blocking - use proxy from ApplicationContext to enable @Async
        getSelf().triggerIncrementalSyncAsync();
        
        return ApiResponse.<String>builder()
                .data("Incremental sync triggered successfully. Processing in background.")
                .message("Incremental sync started")
                .build();
    }
    
    /**
     * Asynchronous method to execute incremental sync.
     */
    @Async
    public void triggerIncrementalSyncAsync() {
        try {
            java.time.LocalDateTime lastRunTime = scheduler.getLastIncrementalRunTime();
            String activeStatus = AccommodationStatusType.ACTIVE.getValue();
            
            log.info("Incremental sync: Fetching hotels modified after {}", lastRunTime);
            
            List<Hotel> modifiedHotels = repository.findByUpdatedAtAfter(activeStatus, lastRunTime);
            
            if (modifiedHotels.isEmpty()) {
                log.info("No hotels modified since last run. Incremental sync skipped.");
                // Update last run time even if no hotels were modified
                scheduler.setLastIncrementalRunTime(java.time.LocalDateTime.now());
                return;
            }
            
            log.info("Incremental sync: Found {} modified hotels", modifiedHotels.size());
            
            BatchResult result = batchService.processBatch(modifiedHotels);
            
            // Update last run time after successful processing
            scheduler.setLastIncrementalRunTime(java.time.LocalDateTime.now());
            
            log.info("Incremental sync completed: Total={}, Success={}, Failed={}, Duration={}ms", 
                    result.getTotalCount(), result.getSuccessCount(), 
                    result.getFailureCount(), result.getDurationMillis());
            
        } catch (Exception e) {
            log.error("Error during admin-triggered incremental sync: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Sync a specific hotel by ID (for debugging/testing).
     * 
     * @param id Hotel ID
     * @return BatchResult with processing details
     */
    @PostMapping(KnowledgeBaseEndpoints.SYNC + KnowledgeBaseEndpoints.HOTEL + CommonEndpoints.ID)
    public ApiResponse<BatchResult> syncHotel(@PathVariable("id") String id) {
        log.info("Admin triggered sync for specific hotel: {}", id);
        
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Hotel ID cannot be null or empty");
        }
        
        // Use specialized query to fetch hotel with all required relationships
        Optional<Hotel> hotelOpt = repository.findByIdForKnowledgeBase(id);
        
        if (hotelOpt.isEmpty()) {
            log.warn("Hotel not found: {}", id);
            return ApiResponse.<BatchResult>builder()
                    .data(BatchResult.builder()
                            .totalCount(0)
                            .successCount(0)
                            .failureCount(1)
                            .failedHotelIds(Collections.singletonList(id))
                            .build())
                    .message("Hotel not found")
                    .build();
        }
        
        Hotel hotel = hotelOpt.get();
        
        // Fetch collections separately to avoid cartesian product
        // Note: This follows the same pattern as findAllActiveHotelsForKnowledgeBase
        List<String> hotelIds = Collections.singletonList(id);
        String activeStatus = AccommodationStatusType.ACTIVE.getValue();
        
        // Fetch amenities
        List<Hotel> hotelsWithAmenities = repository.findHotelsWithAmenities(hotelIds);
        if (!hotelsWithAmenities.isEmpty()) {
            hotel.setAmenities(hotelsWithAmenities.get(0).getAmenities());
        }
        
        // Fetch entertainment venues
        List<Hotel> hotelsWithVenues = repository.findHotelsWithEntertainmentVenues(hotelIds);
        if (!hotelsWithVenues.isEmpty()) {
            hotel.setEntertainmentVenues(hotelsWithVenues.get(0).getEntertainmentVenues());
        }
        
        // Fetch rooms
        List<com.webapp.holidate.entity.accommodation.room.Room> rooms = 
                repository.findRoomsByHotelIds(hotelIds, activeStatus);
        // Ensure each room has the correct hotel reference
        rooms.forEach(room -> room.setHotel(hotel));
        hotel.setRooms(new java.util.HashSet<>(rooms));
        
        // Fetch hotel photos
        List<Hotel> hotelsWithPhotos = repository.findHotelsWithPhotos(hotelIds);
        if (!hotelsWithPhotos.isEmpty()) {
            hotel.setPhotos(hotelsWithPhotos.get(0).getPhotos());
        }
        
        // Fetch room photos
        List<com.webapp.holidate.entity.accommodation.room.Room> roomsWithPhotos = 
                repository.findRoomsWithPhotos(hotelIds, activeStatus);
        // Merge room photos into rooms
        for (com.webapp.holidate.entity.accommodation.room.Room room : rooms) {
            roomsWithPhotos.stream()
                    .filter(r -> r.getId().equals(room.getId()))
                    .findFirst()
                    .ifPresent(r -> room.setPhotos(r.getPhotos()));
        }
        
        List<Hotel> hotels = Collections.singletonList(hotel);
        
        BatchResult result = batchService.processBatch(hotels);
        
        log.info("Hotel sync completed for {}: Success={}, Failed={}", 
                id, result.getSuccessCount(), result.getFailureCount());
        
        return ApiResponse.<BatchResult>builder()
                .data(result)
                .message("Hotel sync completed")
                .build();
    }
}

