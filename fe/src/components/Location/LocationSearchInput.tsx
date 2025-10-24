// src/components/LocationSearchInput.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { locationService, LocationSuggestion, LocationType } from '@/service/locationService';
import styles from './LocationSearchInput.module.css'; // Chúng ta sẽ tạo file CSS này ở bước sau

// --- Hàm tiện ích chỉ dùng cho component này ---
const getTypeLabel = (type: LocationType) => {
    switch (type) {
        case 'HOTEL': return 'Khách sạn';
        case 'PROVINCE': case 'CITY_PROVINCE': return 'Vùng';
        case 'CITY': return 'Thành phố';
        case 'DISTRICT': return 'Quận/Huyện';
        default: return '';
    }
};

// --- Định nghĩa props cho component ---
interface LocationSearchInputProps {
    initialValue?: string;
    onLocationSelect: (location: LocationSuggestion) => void;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ initialValue = '', onLocationSelect }) => {
    const [inputValue, setInputValue] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Cập nhật giá trị input nếu prop initialValue thay đổi (ví dụ khi người dùng điều hướng)
    useEffect(() => {
        setInputValue(initialValue);
    }, [initialValue]);

    // Logic Debounce để gọi API
    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            if (inputValue.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            setIsLoading(true);
            try {
                const results = await locationService.searchLocations({ query: inputValue });
                setSuggestions(results);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm địa điểm:", error);
            } finally {
                setIsLoading(false);
            }
        }, 350);
        return () => clearTimeout(debounceTimer);
    }, [inputValue]);

    // Xử lý khi người dùng chọn một gợi ý
    const handleSelectSuggestion = (location: LocationSuggestion) => {
        setInputValue(location.name); // Cập nhật input với tên đã chọn
        onLocationSelect(location);   // Gửi thông tin location đã chọn ra ngoài cho component cha
        setIsSuggestionsVisible(false); // Đóng danh sách gợi ý
    };

    // Đóng danh sách gợi ý khi click ra ngoài
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
                className="form-control"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsSuggestionsVisible(true)}
                placeholder="Nhập tên khách sạn hoặc địa điểm"
                autoComplete="off"
            />
            {isSuggestionsVisible && inputValue.length > 1 && (
                <ul className={styles.suggestionsList}>
                    {isLoading ? <li className={styles.suggestionInfo}>Đang tìm kiếm...</li>
                        : suggestions.length > 0 ? suggestions.map((suggestion) => (
                            <li key={suggestion.id} className={styles.suggestionItem} onClick={() => handleSelectSuggestion(suggestion)}>
                                <div className={styles.suggestionContent}>
                                    <strong>{suggestion.name}</strong>
                                    <div className={styles.suggestionDescription}>{suggestion.description}</div>
                                </div>
                                <div className={styles.suggestionMeta}>
                                    <span className={styles.suggestionTypeLabel}>{getTypeLabel(suggestion.type)}</span>
                                    {suggestion.hotelCount && suggestion.hotelCount > 0 && (
                                        <span className={styles.suggestionHotelCount}>{suggestion.hotelCount.toLocaleString('vi-VN')} khách sạn</span>
                                    )}
                                </div>
                            </li>
                        )) : <li className={styles.suggestionInfo}>Không tìm thấy kết quả phù hợp.</li>}
                </ul>
            )}
        </div>
    );
};

export default LocationSearchInput;