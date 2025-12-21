package com.webapp.holidate.service.knowledgebase;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Service for generating URL-friendly slugs from Vietnamese text.
 * Handles Vietnamese diacritics and special characters conversion.
 * 
 * Examples:
 * - "Đà Nẵng" -> "da-nang"
 * - "Khách sạn Grand Mercure" -> "khach-san-grand-mercure"
 * - "Hồ Chí Minh" -> "ho-chi-minh"
 */
@Slf4j
@Service
public class SlugService {
    
    // Vietnamese character mapping for characters not handled by Normalizer
    private static final Map<String, String> VIETNAMESE_MAP = new HashMap<>();
    
    static {
        // Lowercase Vietnamese characters
        VIETNAMESE_MAP.put("đ", "d");
        VIETNAMESE_MAP.put("Đ", "d");
        
        // Additional mappings if needed
        VIETNAMESE_MAP.put("ơ", "o");
        VIETNAMESE_MAP.put("ư", "u");
        VIETNAMESE_MAP.put("ă", "a");
        VIETNAMESE_MAP.put("â", "a");
        VIETNAMESE_MAP.put("ê", "e");
        VIETNAMESE_MAP.put("ô", "o");
        
        // Uppercase variants
        VIETNAMESE_MAP.put("Ơ", "o");
        VIETNAMESE_MAP.put("Ư", "u");
        VIETNAMESE_MAP.put("Ă", "a");
        VIETNAMESE_MAP.put("Â", "a");
        VIETNAMESE_MAP.put("Ê", "e");
        VIETNAMESE_MAP.put("Ô", "o");
    }
    
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-{2,}");
    
    /**
     * Generate URL-friendly slug from Vietnamese text.
     * 
     * @param input Vietnamese text
     * @return Lowercase slug with hyphens
     */
    public String generateSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }
        
        // Step 1: Replace Vietnamese specific characters
        String result = input;
        for (Map.Entry<String, String> entry : VIETNAMESE_MAP.entrySet()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        
        // Step 2: Normalize to remove diacritics (accents)
        result = Normalizer.normalize(result, Normalizer.Form.NFD);
        result = result.replaceAll("\\p{M}", ""); // Remove all marks
        
        // Step 3: Convert to lowercase
        result = result.toLowerCase();
        
        // Step 4: Replace whitespace with hyphens
        result = WHITESPACE.matcher(result).replaceAll("-");
        
        // Step 5: Remove non-latin characters (except hyphens and underscores)
        result = NONLATIN.matcher(result).replaceAll("");
        
        // Step 6: Remove multiple consecutive hyphens
        result = MULTIPLE_HYPHENS.matcher(result).replaceAll("-");
        
        // Step 7: Remove leading/trailing hyphens
        result = result.replaceAll("^-+|-+$", "");
        
        return result;
    }
    
    /**
     * Convert text to snake_case format (for amenity tags).
     * 
     * @param input Text to convert
     * @return snake_case formatted string
     */
    public String toSnakeCase(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }
        
        // Use slug generation then replace hyphens with underscores
        String slug = generateSlug(input);
        return slug.replace("-", "_");
    }
    
    /**
     * Generate filename-safe string (for markdown files).
     * 
     * @param input Hotel name or text
     * @return Filename-safe string with .md extension
     */
    public String generateFilename(String input) {
        return generateSlug(input) + ".md";
    }
}

