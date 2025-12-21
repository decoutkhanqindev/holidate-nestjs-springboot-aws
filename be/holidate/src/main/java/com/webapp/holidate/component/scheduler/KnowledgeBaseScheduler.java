package com.webapp.holidate.component.scheduler;

import com.webapp.holidate.dto.knowledgebase.BatchResult;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.repository.knowledgebase.KnowledgeBaseRepository;
import com.webapp.holidate.service.knowledgebase.KnowledgeBaseBatchService;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Scheduler for Knowledge Base generation and synchronization.
 * 
 * Provides two scheduled jobs:
 * 1. Full Sync: Regenerates all active hotels (weekly, Sunday 2 AM)
 * 2. Incremental Sync: Processes only modified hotels (hourly, every hour)
 * 
 * State Management:
 * - Uses AtomicReference to store lastIncrementalRunTime (thread-safe)
 * - For production, consider using Redis or database for persistence
 */
@Slf4j
@Component
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class KnowledgeBaseScheduler {
    
    KnowledgeBaseRepository repository;
    KnowledgeBaseBatchService batchService;
    
    /**
     * Thread-safe storage for last incremental run time.
     * For production, consider using Redis or database for persistence across restarts.
     */
    private final AtomicReference<LocalDateTime> lastIncrementalRunTime = 
            new AtomicReference<>(LocalDateTime.now().minusHours(1));
    
    /**
     * Full synchronization job.
     * Processes all active hotels for Knowledge Base generation.
     * Runs weekly on Sunday at 2:00 AM.
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    public void fullSync() {
        log.info("=== Starting Full Knowledge Base Sync ===");
        
        try {
            String activeStatus = AccommodationStatusType.ACTIVE.getValue();
            List<Hotel> hotels = repository.findAllActiveHotelsForKnowledgeBase(activeStatus);
            
            log.info("Found {} active hotels for full sync", hotels.size());
            
            if (hotels.isEmpty()) {
                log.info("No active hotels found. Skipping full sync.");
                return;
            }
            
            BatchResult result = batchService.processBatch(hotels);
            
            log.info("=== Full Sync Completed ===");
            log.info("Total: {}, Success: {}, Failed: {}, Duration: {}ms", 
                    result.getTotalCount(), result.getSuccessCount(), 
                    result.getFailureCount(), result.getDurationMillis());
            
            if (result.getFailureCount() > 0) {
                log.warn("Some hotels failed during full sync. Failed IDs: {}", 
                        result.getFailedHotelIds());
            }
            
        } catch (Exception e) {
            log.error("Error during full Knowledge Base sync: {}", e.getMessage(), e);
            // Don't rethrow - let the scheduler continue for next run
        }
    }
    
    /**
     * Incremental synchronization job.
     * Processes only hotels that have been modified since the last run.
     * Runs hourly at minute 0.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void incrementalSync() {
        log.info("=== Starting Incremental Knowledge Base Sync ===");
        
        try {
            LocalDateTime lastRunTime = lastIncrementalRunTime.get();
            String activeStatus = AccommodationStatusType.ACTIVE.getValue();
            
            log.debug("Fetching hotels modified after: {}", lastRunTime);
            
            List<Hotel> modifiedHotels = repository.findByUpdatedAtAfter(activeStatus, lastRunTime);
            
            if (modifiedHotels.isEmpty()) {
                log.info("No hotels modified since last run ({}). Skipping incremental sync.", 
                        lastRunTime);
                // Update last run time even if no hotels were modified
                lastIncrementalRunTime.set(LocalDateTime.now());
                return;
            }
            
            log.info("Found {} modified hotels for incremental sync", modifiedHotels.size());
            
            BatchResult result = batchService.processBatch(modifiedHotels);
            
            // Update last run time after successful processing
            LocalDateTime newLastRunTime = LocalDateTime.now();
            lastIncrementalRunTime.set(newLastRunTime);
            
            log.info("=== Incremental Sync Completed ===");
            log.info("Total: {}, Success: {}, Failed: {}, Duration: {}ms", 
                    result.getTotalCount(), result.getSuccessCount(), 
                    result.getFailureCount(), result.getDurationMillis());
            
            if (result.getFailureCount() > 0) {
                log.warn("Some hotels failed during incremental sync. Failed IDs: {}", 
                        result.getFailedHotelIds());
            }
            
        } catch (Exception e) {
            log.error("Error during incremental Knowledge Base sync: {}", e.getMessage(), e);
            // Don't rethrow - let the scheduler continue for next run
        }
    }
    
    /**
     * Get the last incremental run time (for monitoring/debugging).
     * 
     * @return Last run time
     */
    public LocalDateTime getLastIncrementalRunTime() {
        return lastIncrementalRunTime.get();
    }
    
    /**
     * Manually set the last incremental run time (for admin operations).
     * 
     * @param time Time to set
     */
    public void setLastIncrementalRunTime(LocalDateTime time) {
        lastIncrementalRunTime.set(time);
        log.info("Manually updated last incremental run time to: {}", time);
    }
}

