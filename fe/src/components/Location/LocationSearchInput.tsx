'use client';

import { useState, useEffect, useRef } from 'react';
import { locationService, LocationSuggestion, LocationType } from '@/service/locationService';
import styles from './LocationSearchInput.module.css';

// --- CÁC HÀM TIỆN ÍCH ---
const getTypeLabel = (type: LocationType) => {
    // ... (hàm này giữ nguyên)
    switch (type) {
        case 'HOTEL': return 'Khách sạn';
        case 'PROVINCE': case 'CITY_PROVINCE': return 'Khu vực';
        case 'CITY': return 'Thành phố';
        case 'DISTRICT': return 'Khu vực';
        default: return 'Địa điểm';
    }
};

/**
 * << HÀM MỚI ĐỂ XỬ LÝ HIỂN THỊ ĐỊA CHỈ >>
 * Hàm này sẽ nhận vào chuỗi description gốc và loại bỏ phần số đường ở đầu.
 * Ví dụ: "15-16, Phường Mân Thái, Quận Sơn Trà" -> "Phường Mân Thái, Quận Sơn Trà"
 */
const formatSuggestionDescription = (description: string, type: LocationType): string => {
    if (type !== 'HOTEL') {
        // Nếu không phải là khách sạn (là thành phố, quận...), giữ nguyên mô tả
        return description;
    }

    // Nếu là khách sạn, tìm dấu phẩy đầu tiên và cắt bỏ phần đứng trước nó
    const firstCommaIndex = description.indexOf(',');
    if (firstCommaIndex !== -1) {
        // Cắt chuỗi từ vị trí sau dấu phẩy và xóa khoảng trắng thừa
        return description.substring(firstCommaIndex + 1).trim();
    }

    // Nếu không có dấu phẩy, trả về chuỗi gốc để tránh lỗi
    return description;
};


interface LocationSearchInputProps {
    initialValue?: string;
    onLocationSelect: (location: LocationSuggestion) => void;
    onQueryChange: (query: string) => void;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ initialValue = '', onLocationSelect, onQueryChange }) => {
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // ... (toàn bộ logic useEffect và các hàm handler giữ nguyên) ...
    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            if (initialValue.trim().length === 0) {
                setSuggestions([]);
                setIsSuggestionsVisible(true);
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


    return (
        <div className={styles.searchInputWrapper} ref={wrapperRef}>
            <input
                type="text"
                className={styles.locationInput}
                value={initialValue}
                onChange={(e) => onQueryChange(e.target.value)}
                onFocus={() => setIsSuggestionsVisible(true)}
                placeholder="Tìm thành phố, khách sạn..."
                autoComplete="off"
            />
            {isSuggestionsVisible && (
                <ul className={styles.suggestionsList}>
                    {initialValue && (
                        <li className={styles.suggestionInfo}>
                            Nhập thêm ký tự để nhận kết quả chính xác hơn
                        </li>
                    )}
                    {isLoading ? <li className={styles.suggestionInfo}>Đang tìm kiếm...</li>
                        : suggestions.map((suggestion) => (
                            <li key={suggestion.id} className={styles.suggestionItem} onClick={() => handleSelectSuggestion(suggestion)}>
                                <div className={styles.suggestionContent}>
                                    <span className={styles.suggestionName}>{suggestion.name}</span>
                                    {/* << SỬ DỤNG HÀM MỚI KHI RENDER >> */}
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
                    {!isLoading && suggestions.length === 0 && initialValue && (
                        <li className={styles.suggestionInfo}>Không tìm thấy kết quả phù hợp.</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default LocationSearchInput;