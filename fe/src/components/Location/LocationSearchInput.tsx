'use client';

import { useState, useEffect, useRef } from 'react';
import { locationService, LocationSuggestion, LocationType } from '@/service/locationService';
import styles from './LocationSearchInput.module.css';

// --- CÁC HÀM TIỆN ÍCH GIỮ NGUYÊN ---
const getTypeLabel = (type: LocationType) => {
    switch (type) {
        case 'HOTEL': return 'Khách sạn';
        case 'PROVINCE': case 'CITY_PROVINCE': return 'Khu vực';
        case 'CITY': return 'Thành phố';
        case 'DISTRICT': return 'Khu vực';
        default: return 'Địa điểm';
    }
};

const formatSuggestionDescription = (description: string, type: LocationType): string => {
    if (type !== 'HOTEL') return description;
    const firstCommaIndex = description.indexOf(',');
    return firstCommaIndex !== -1 ? description.substring(firstCommaIndex + 1).trim() : description;
};


// Thêm prop `mode` vào interface
interface LocationSearchInputProps {
    initialValue?: string;
    onLocationSelect: (location: LocationSuggestion) => void;
    onQueryChange: (query: string) => void;
    mode?: 'standalone' | 'embedded'; // Prop mới
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
    initialValue = '',
    onLocationSelect,
    onQueryChange,
    mode = 'standalone' // Đặt giá trị mặc định là 'standalone'
}) => {
    // --- TOÀN BỘ LOGIC, STATE, USEEFFECT GIỮ NGUYÊN ---
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            if (initialValue.trim().length === 0) {
                setSuggestions([]);
                return;
            }
            if (initialValue.trim().length >= 1) {
                setIsLoading(true);
                const results = await locationService.searchLocations({ query: initialValue });
                setSuggestions(results);
                setIsLoading(false);
            }
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [initialValue]);

    const handleSelectSuggestion = (location: LocationSuggestion) => {
        onLocationSelect(location);
        setIsSuggestionsVisible(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsSuggestionsVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);


    // --- Thay đổi cách render JSX dựa vào `mode` ---
    return (
        <div className={mode === 'standalone' ? styles.standaloneWrapper : ''} ref={wrapperRef}>
            <input
                type="text"
                className={mode === 'standalone'
                    ? styles.locationInput
                    : "w-full h-12 px-1 text-base font-medium bg-transparent border-b border-gray-200 focus:outline-none focus:ring-0"
                }
                value={initialValue}
                onChange={(e) => onQueryChange(e.target.value)}
                onFocus={() => setIsSuggestionsVisible(true)}
                placeholder="Tìm thành phố, khách sạn..."
                autoComplete="off"
                autoFocus={mode === 'embedded'} // Chỉ autoFocus ở HomePage
            />

            {isSuggestionsVisible && (
                <ul className={
                    mode === 'standalone'
                        ? styles.suggestionsListStandalone
                        : styles.suggestionsListEmbedded
                }>
                    {isLoading ? <li className={styles.suggestionInfo}>Đang tìm kiếm...</li>
                        : suggestions.map((suggestion) => (
                            <li key={suggestion.id} className={styles.suggestionItem} onClick={() => handleSelectSuggestion(suggestion)}>
                                <div className={styles.suggestionContent}>
                                    <span className={styles.suggestionName}>{suggestion.name}</span>
                                    <span className={styles.suggestionDescription}>
                                        {formatSuggestionDescription(suggestion.description, suggestion.type)}
                                    </span>
                                </div>
                                <div className={styles.suggestionMeta}>
                                    <span className={styles.suggestionTypeLabel}>{getTypeLabel(suggestion.type)}</span>
                                    {suggestion.hotelCount && suggestion.hotelCount > 0 && (
                                        <span className={styles.suggestionHotelCount}>{suggestion.hotelCount.toLocaleString('vi-VN')} khách sạn</span>
                                    )}
                                </div>
                            </li>
                        ))
                    }
                    {!isLoading && suggestions.length === 0 && initialValue.trim().length > 0 && (
                        <li className={styles.suggestionInfo}>Không tìm thấy kết quả phù hợp.</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default LocationSearchInput;