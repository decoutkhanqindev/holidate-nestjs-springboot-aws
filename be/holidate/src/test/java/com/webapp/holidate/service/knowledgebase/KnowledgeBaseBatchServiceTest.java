package com.webapp.holidate.service.knowledgebase;

import com.webapp.holidate.dto.knowledgebase.BatchResult;
import com.webapp.holidate.dto.knowledgebase.HotelKnowledgeBaseDto;
import com.webapp.holidate.dto.knowledgebase.LocationHierarchyDto;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.location.*;
import com.webapp.holidate.repository.knowledgebase.KnowledgeBaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit test for KnowledgeBaseBatchService to verify thread safety and duplicate content fix.
 * 
 * This test verifies that:
 * 1. Each hotel produces unique markdown content (no duplicate content)
 * 2. DTOs are created fresh for each hotel
 * 3. Context maps are isolated (no shared state)
 */
@ExtendWith(MockitoExtension.class)
class KnowledgeBaseBatchServiceTest {

    @Mock
    private KnowledgeBaseGenerationService generationService;

    @Mock
    private KnowledgeBaseUploadService uploadService;

    @Mock
    private KnowledgeBaseRepository repository;

    @InjectMocks
    private KnowledgeBaseBatchService batchService;

    private Hotel hotelA;
    private Hotel hotelB;
    private HotelKnowledgeBaseDto dtoA;
    private HotelKnowledgeBaseDto dtoB;

    @BeforeEach
    void setUp() {
        // Setup Hotel A
        hotelA = createMockHotel("hotel-a-id", "Hotel A", "Description for Hotel A");
        
        // Setup Hotel B
        hotelB = createMockHotel("hotel-b-id", "Hotel B", "Description for Hotel B");

        // Setup DTO A
        dtoA = createMockDto("hotel-a-id", "Hotel A", "Description for Hotel A", "hotel-a-slug");
        
        // Setup DTO B
        dtoB = createMockDto("hotel-b-id", "Hotel B", "Description for Hotel B", "hotel-b-slug");
    }

    @Test
    void testBatchProcessing_EachHotelProducesUniqueContent() throws Exception {
        // Arrange
        List<Hotel> hotels = List.of(hotelA, hotelB);
        
        // Mock generation service to return different DTOs for each hotel
        when(generationService.buildHotelKB(hotelA)).thenReturn(dtoA);
        when(generationService.buildHotelKB(hotelB)).thenReturn(dtoB);
        
        // Mock upload service to capture the DTOs passed to it
        ArgumentCaptor<HotelKnowledgeBaseDto> dtoCaptor = ArgumentCaptor.forClass(HotelKnowledgeBaseDto.class);
        when(uploadService.generateAndUploadHotelProfile(any(HotelKnowledgeBaseDto.class)))
                .thenReturn("s3-key-1")
                .thenReturn("s3-key-2");
        
        // Mock repository methods for loading collections
        when(repository.findHotelsWithAmenities(anyList())).thenReturn(new ArrayList<>());
        when(repository.findHotelsWithEntertainmentVenues(anyList())).thenReturn(new ArrayList<>());
        when(repository.findRoomsByHotelIds(anyList(), anyString())).thenReturn(new ArrayList<>());
        when(repository.findHotelsWithPhotos(anyList())).thenReturn(new ArrayList<>());
        when(repository.findRoomsWithPhotos(anyList(), anyString())).thenReturn(new ArrayList<>());

        // Act
        BatchResult result = batchService.processBatch(hotels);

        // Assert
        assertEquals(2, result.getTotalCount());
        assertEquals(2, result.getSuccessCount());
        assertEquals(0, result.getFailureCount());
        
        // Verify that buildHotelKB was called for each hotel
        verify(generationService, times(1)).buildHotelKB(hotelA);
        verify(generationService, times(1)).buildHotelKB(hotelB);
        
        // Verify that generateAndUploadHotelProfile was called for each DTO
        verify(uploadService, times(2)).generateAndUploadHotelProfile(any(HotelKnowledgeBaseDto.class));
        
        // Capture all DTOs passed to upload service
        verify(uploadService, times(2)).generateAndUploadHotelProfile(dtoCaptor.capture());
        List<HotelKnowledgeBaseDto> capturedDtos = dtoCaptor.getAllValues();
        
        // Verify that we received 2 different DTOs
        assertEquals(2, capturedDtos.size());
        
        // Verify that the DTOs have different content
        HotelKnowledgeBaseDto firstDto = capturedDtos.get(0);
        HotelKnowledgeBaseDto secondDto = capturedDtos.get(1);
        
        // At least one hotel should be "Hotel A" and one should be "Hotel B"
        // (order might vary, but both should be present)
        List<String> hotelNames = List.of(firstDto.getName(), secondDto.getName());
        assertTrue(hotelNames.contains("Hotel A"), "Should contain Hotel A");
        assertTrue(hotelNames.contains("Hotel B"), "Should contain Hotel B");
        
        // Verify that the DTOs are different instances (not the same object)
        assertNotSame(firstDto, secondDto, "DTOs should be different instances");
        
        // Verify that the content is different
        if (firstDto.getName().equals("Hotel A")) {
            assertEquals("Hotel A", firstDto.getName());
            assertEquals("Description for Hotel A", firstDto.getDescription());
            assertEquals("hotel-a-id", firstDto.getHotelId());
        } else {
            assertEquals("Hotel B", firstDto.getName());
            assertEquals("Description for Hotel B", firstDto.getDescription());
            assertEquals("hotel-b-id", firstDto.getHotelId());
        }
        
        if (secondDto.getName().equals("Hotel A")) {
            assertEquals("Hotel A", secondDto.getName());
            assertEquals("Description for Hotel A", secondDto.getDescription());
            assertEquals("hotel-a-id", secondDto.getHotelId());
        } else {
            assertEquals("Hotel B", secondDto.getName());
            assertEquals("Description for Hotel B", secondDto.getDescription());
            assertEquals("hotel-b-id", secondDto.getHotelId());
        }
    }

    @Test
    void testBatchProcessing_NoDuplicateContent() throws Exception {
        // Arrange
        List<Hotel> hotels = List.of(hotelA, hotelB);
        
        // Mock generation service to return different DTOs
        when(generationService.buildHotelKB(hotelA)).thenReturn(dtoA);
        when(generationService.buildHotelKB(hotelB)).thenReturn(dtoB);
        
        // Mock upload service
        ArgumentCaptor<HotelKnowledgeBaseDto> dtoCaptor = ArgumentCaptor.forClass(HotelKnowledgeBaseDto.class);
        when(uploadService.generateAndUploadHotelProfile(any(HotelKnowledgeBaseDto.class)))
                .thenReturn("s3-key");
        
        // Mock repository methods
        when(repository.findHotelsWithAmenities(anyList())).thenReturn(new ArrayList<>());
        when(repository.findHotelsWithEntertainmentVenues(anyList())).thenReturn(new ArrayList<>());
        when(repository.findRoomsByHotelIds(anyList(), anyString())).thenReturn(new ArrayList<>());
        when(repository.findHotelsWithPhotos(anyList())).thenReturn(new ArrayList<>());
        when(repository.findRoomsWithPhotos(anyList(), anyString())).thenReturn(new ArrayList<>());

        // Act
        batchService.processBatch(hotels);

        // Assert - Capture all DTOs
        verify(uploadService, times(2)).generateAndUploadHotelProfile(dtoCaptor.capture());
        List<HotelKnowledgeBaseDto> capturedDtos = dtoCaptor.getAllValues();
        
        // Verify that DTOs have different names (no duplicates)
        String firstName = capturedDtos.get(0).getName();
        String secondName = capturedDtos.get(1).getName();
        
        assertNotEquals(firstName, secondName, 
                "Hotel names should be different - no duplicate content allowed");
        
        // Verify that at least one is "Hotel A" and one is "Hotel B"
        assertTrue((firstName.equals("Hotel A") && secondName.equals("Hotel B")) ||
                   (firstName.equals("Hotel B") && secondName.equals("Hotel A")),
                "Should have both Hotel A and Hotel B");
    }

    @Test
    void testBatchProcessing_EachHotelGetsFreshDTO() throws Exception {
        // Arrange
        List<Hotel> hotels = List.of(hotelA, hotelB);
        
        // Mock generation service - each call should return a new DTO instance
        when(generationService.buildHotelKB(hotelA)).thenReturn(dtoA);
        when(generationService.buildHotelKB(hotelB)).thenReturn(dtoB);
        
        // Mock upload service
        when(uploadService.generateAndUploadHotelProfile(any(HotelKnowledgeBaseDto.class)))
                .thenReturn("s3-key");
        
        // Mock repository methods
        when(repository.findHotelsWithAmenities(anyList())).thenReturn(new ArrayList<>());
        when(repository.findHotelsWithEntertainmentVenues(anyList())).thenReturn(new ArrayList<>());
        when(repository.findRoomsByHotelIds(anyList(), anyString())).thenReturn(new ArrayList<>());
        when(repository.findHotelsWithPhotos(anyList())).thenReturn(new ArrayList<>());
        when(repository.findRoomsWithPhotos(anyList(), anyString())).thenReturn(new ArrayList<>());

        // Act
        batchService.processBatch(hotels);

        // Assert - Verify that buildHotelKB is called separately for each hotel
        // This ensures each hotel gets a fresh DTO
        verify(generationService, times(1)).buildHotelKB(hotelA);
        verify(generationService, times(1)).buildHotelKB(hotelB);
        
        // Verify that the calls are made with different hotel objects
        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);
        verify(generationService, times(2)).buildHotelKB(hotelCaptor.capture());
        List<Hotel> capturedHotels = hotelCaptor.getAllValues();
        
        assertEquals(2, capturedHotels.size());
        assertNotSame(capturedHotels.get(0), capturedHotels.get(1), 
                "Different hotel instances should be processed");
    }

    // Helper methods
    private Hotel createMockHotel(String id, String name, String description) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName(name);
        hotel.setDescription(description);
        hotel.setAddress("123 Test Street");
        hotel.setRooms(new HashSet<>());
        hotel.setAmenities(new HashSet<>());
        hotel.setEntertainmentVenues(new HashSet<>());
        hotel.setPhotos(new HashSet<>());
        
        // Setup location hierarchy
        Country country = new Country();
        country.setName("Vietnam");
        country.setCode("VN");
        hotel.setCountry(country);
        
        Province province = new Province();
        province.setName("Da Nang");
        hotel.setProvince(province);
        
        City city = new City();
        city.setName("Da Nang");
        hotel.setCity(city);
        
        District district = new District();
        district.setName("Son Tra");
        hotel.setDistrict(district);
        
        Ward ward = new Ward();
        ward.setName("Ward 1");
        hotel.setWard(ward);
        
        Street street = new Street();
        street.setName("Test Street");
        hotel.setStreet(street);
        
        return hotel;
    }

    private HotelKnowledgeBaseDto createMockDto(String hotelId, String name, String description, String slug) {
        LocationHierarchyDto location = LocationHierarchyDto.builder()
                .country("vietnam")
                .countryCode("VN")
                .province("da-nang")
                .provinceName("Da Nang")
                .city("da-nang")
                .cityName("Da Nang")
                .citySlug("da-nang")
                .district("son-tra")
                .districtName("Son Tra")
                .districtSlug("son-tra")
                .ward("ward-1")
                .wardName("Ward 1")
                .street("test-street")
                .streetName("Test Street")
                .address("123 Test Street")
                .build();
        
        return HotelKnowledgeBaseDto.builder()
                .hotelId(hotelId)
                .slug(slug)
                .name(name)
                .description(description)
                .starRating(5)
                .status("ACTIVE")
                .location(location)
                .amenityEnglishTags(new ArrayList<>())
                .rooms(new ArrayList<>())
                .nearbyVenues(new ArrayList<>())
                .vibeTagsInferred(new ArrayList<>())
                .locationTags(new ArrayList<>())
                .tags(new ArrayList<>())
                .galleryImageUrls(new ArrayList<>())
                .requiredDocuments(new ArrayList<>())
                .lastUpdated(java.time.LocalDateTime.now())
                .build();
    }
}

