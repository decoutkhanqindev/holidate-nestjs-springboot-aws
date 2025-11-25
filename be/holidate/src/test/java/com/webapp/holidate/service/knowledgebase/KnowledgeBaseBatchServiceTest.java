package com.webapp.holidate.service.knowledgebase;

import com.webapp.holidate.dto.knowledgebase.BatchResult;
import com.webapp.holidate.dto.knowledgebase.HotelKnowledgeBaseDto;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for KnowledgeBaseBatchService.
 * 
 * Test Cases:
 * 1. Success Flow: Process 2 hotels successfully
 * 2. Partial Failure: First hotel fails, second succeeds
 * 3. Empty List: Handle empty list gracefully
 */
@ExtendWith(MockitoExtension.class)
class KnowledgeBaseBatchServiceTest {
    
    @Mock
    private KnowledgeBaseGenerationService generationService;
    
    @Mock
    private KnowledgeBaseUploadService uploadService;
    
    @InjectMocks
    private KnowledgeBaseBatchService batchService;
    
    private Hotel hotel1;
    private Hotel hotel2;
    private HotelKnowledgeBaseDto dto1;
    private HotelKnowledgeBaseDto dto2;
    
    @BeforeEach
    void setUp() {
        // Setup hotel1
        hotel1 = Hotel.builder()
                .id("hotel-1")
                .name("Test Hotel 1")
                .status(AccommodationStatusType.ACTIVE.getValue())
                .rooms(new HashSet<>())
                .build();
        
        // Setup hotel2
        hotel2 = Hotel.builder()
                .id("hotel-2")
                .name("Test Hotel 2")
                .status(AccommodationStatusType.ACTIVE.getValue())
                .rooms(new HashSet<>())
                .build();
        
        // Setup DTOs
        dto1 = HotelKnowledgeBaseDto.builder()
                .hotelId("hotel-1")
                .name("Test Hotel 1")
                .build();
        
        dto2 = HotelKnowledgeBaseDto.builder()
                .hotelId("hotel-2")
                .name("Test Hotel 2")
                .build();
    }
    
    /**
     * Test Case 1: Success Flow
     * Verify that when processing 2 hotels successfully:
     * - uploadService.generateAndUploadHotelProfile is called exactly 2 times
     * - Result counts: success=2, failure=0
     * - No failed hotel IDs
     */
    @Test
    void testProcessBatch_SuccessFlow() throws Exception {
        // Given
        List<Hotel> hotels = List.of(hotel1, hotel2);
        
        when(generationService.buildHotelKB(hotel1)).thenReturn(dto1);
        when(generationService.buildHotelKB(hotel2)).thenReturn(dto2);
        when(uploadService.generateAndUploadHotelProfile(dto1)).thenReturn("s3://bucket/hotel1.md");
        when(uploadService.generateAndUploadHotelProfile(dto2)).thenReturn("s3://bucket/hotel2.md");
        
        // When
        BatchResult result = batchService.processBatch(hotels);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalCount());
        assertEquals(2, result.getSuccessCount());
        assertEquals(0, result.getFailureCount());
        assertTrue(result.getFailedHotelIds().isEmpty());
        assertNotNull(result.getStartTime());
        assertNotNull(result.getEndTime());
        assertTrue(result.getDurationMillis() >= 0);
        
        // Verify interactions
        verify(generationService, times(2)).buildHotelKB(any(Hotel.class));
        verify(uploadService, times(2)).generateAndUploadHotelProfile(any(HotelKnowledgeBaseDto.class));
        verify(uploadService).generateAndUploadHotelProfile(dto1);
        verify(uploadService).generateAndUploadHotelProfile(dto2);
    }
    
    /**
     * Test Case 2: Partial Failure
     * Verify that when the first hotel fails:
     * - Second hotel is still processed
     * - Result counts: success=1, failure=1
     * - Failed hotel ID is tracked
     */
    @Test
    void testProcessBatch_PartialFailure() throws Exception {
        // Given
        List<Hotel> hotels = List.of(hotel1, hotel2);
        
        // First hotel fails during generation
        when(generationService.buildHotelKB(hotel1))
                .thenThrow(new RuntimeException("Generation failed for hotel 1"));
        
        // Second hotel succeeds
        when(generationService.buildHotelKB(hotel2)).thenReturn(dto2);
        when(uploadService.generateAndUploadHotelProfile(dto2)).thenReturn("s3://bucket/hotel2.md");
        
        // When
        BatchResult result = batchService.processBatch(hotels);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalCount());
        assertEquals(1, result.getSuccessCount());
        assertEquals(1, result.getFailureCount());
        assertEquals(1, result.getFailedHotelIds().size());
        assertTrue(result.getFailedHotelIds().contains("hotel-1"));
        assertFalse(result.getFailedHotelIds().contains("hotel-2"));
        
        // Verify interactions
        verify(generationService, times(2)).buildHotelKB(any(Hotel.class));
        // First hotel failed, so uploadService should only be called once (for hotel2)
        verify(uploadService, times(1)).generateAndUploadHotelProfile(any(HotelKnowledgeBaseDto.class));
        verify(uploadService).generateAndUploadHotelProfile(dto2);
        verify(uploadService, never()).generateAndUploadHotelProfile(dto1);
    }
    
    /**
     * Test Case 3: Empty List
     * Verify that the service handles an empty list gracefully without errors.
     */
    @Test
    void testProcessBatch_EmptyList() {
        // Given
        List<Hotel> hotels = new ArrayList<>();
        
        // When
        BatchResult result = batchService.processBatch(hotels);
        
        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalCount());
        assertEquals(0, result.getSuccessCount());
        assertEquals(0, result.getFailureCount());
        assertTrue(result.getFailedHotelIds().isEmpty());
        assertNotNull(result.getStartTime());
        assertNotNull(result.getEndTime());
        
        // Verify no interactions with services
        verifyNoInteractions(generationService);
        verifyNoInteractions(uploadService);
    }
    
    /**
     * Test Case 4: Null List
     * Verify that the service handles a null list gracefully.
     */
    @Test
    void testProcessBatch_NullList() {
        // Given
        List<Hotel> hotels = null;
        
        // When
        BatchResult result = batchService.processBatch(hotels);
        
        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalCount());
        assertEquals(0, result.getSuccessCount());
        assertEquals(0, result.getFailureCount());
        assertTrue(result.getFailedHotelIds().isEmpty());
        
        // Verify no interactions with services
        verifyNoInteractions(generationService);
        verifyNoInteractions(uploadService);
    }
    
    /**
     * Test Case 5: Failure During Upload
     * Verify that failure during upload is handled correctly.
     */
    @Test
    void testProcessBatch_FailureDuringUpload() throws Exception {
        // Given
        List<Hotel> hotels = List.of(hotel1, hotel2);
        
        when(generationService.buildHotelKB(hotel1)).thenReturn(dto1);
        when(generationService.buildHotelKB(hotel2)).thenReturn(dto2);
        
        // First hotel fails during upload
        when(uploadService.generateAndUploadHotelProfile(dto1))
                .thenThrow(new RuntimeException("S3 upload failed"));
        
        // Second hotel succeeds
        when(uploadService.generateAndUploadHotelProfile(dto2)).thenReturn("s3://bucket/hotel2.md");
        
        // When
        BatchResult result = batchService.processBatch(hotels);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalCount());
        assertEquals(1, result.getSuccessCount());
        assertEquals(1, result.getFailureCount());
        assertEquals(1, result.getFailedHotelIds().size());
        assertTrue(result.getFailedHotelIds().contains("hotel-1"));
        
        // Verify interactions
        verify(generationService, times(2)).buildHotelKB(any(Hotel.class));
        verify(uploadService, times(2)).generateAndUploadHotelProfile(any(HotelKnowledgeBaseDto.class));
    }
    
    /**
     * Test Case 6: All Hotels Fail
     * Verify that when all hotels fail, the result correctly reflects all failures.
     */
    @Test
    void testProcessBatch_AllHotelsFail() {
        // Given
        List<Hotel> hotels = List.of(hotel1, hotel2);
        
        // Both hotels fail during generation
        when(generationService.buildHotelKB(hotel1))
                .thenThrow(new RuntimeException("Generation failed for hotel 1"));
        when(generationService.buildHotelKB(hotel2))
                .thenThrow(new RuntimeException("Generation failed for hotel 2"));
        
        // When
        BatchResult result = batchService.processBatch(hotels);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalCount());
        assertEquals(0, result.getSuccessCount());
        assertEquals(2, result.getFailureCount());
        assertEquals(2, result.getFailedHotelIds().size());
        assertTrue(result.getFailedHotelIds().contains("hotel-1"));
        assertTrue(result.getFailedHotelIds().contains("hotel-2"));
        
        // Verify interactions
        verify(generationService, times(2)).buildHotelKB(any(Hotel.class));
        // No uploads should occur since generation failed for both
        verifyNoInteractions(uploadService);
    }
}

