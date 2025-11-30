// File: app/search/AmenityFilter.tsx

'use client';

import { useState, useEffect } from 'react';
import { amenityService, Amenity } from '@/service/amenityService';
import styles from './SearchPage.module.css'; // Dùng chung style

interface AmenityFilterProps {
    categoryId: string;
    categoryName: string;
    selectedAmenities: string[];
    onAmenityChange: (amenityId: string, isSelected: boolean) => void;
}

const translateAmenityName = (name: string) => {
    const amenityNameMap: { [key: string]: string } = { 'EARLY_CHECK_IN': 'Nhận phòng sớm', 'BLACKOUT_CURTAINS': 'Rèm cản sáng' };
    return amenityNameMap[name] || name;
};


const AmenityFilter: React.FC<AmenityFilterProps> = ({ categoryId, categoryName, selectedAmenities, onAmenityChange }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        amenityService.getAmenitiesByCategoryId(categoryId)
            .then(data => {
                setAmenities(data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [categoryId]);

    const displayedAmenities = showAll ? amenities : amenities.slice(0, 5);

    if (isLoading) {
        return (
            <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <strong style={{ color: '#000' }}>{categoryName}</strong>
                <div style={{ fontSize: 14, color: '#888', marginTop: 8 }}>Đang tải...</div>
            </div>
        );
    }

    if (amenities.length === 0) {
        return null; // Không hiển thị section nếu không có tiện ích nào
    }

    return (
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className={styles.filterSectionHeader} onClick={() => setIsOpen(!isOpen)}>
                <strong style={{ color: '#000' }}>{categoryName}</strong>
                <button className={`${styles.filterToggleButton} ${!isOpen ? styles.collapsed : ''}`}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" /></svg></button>
            </div>
            <div className={`${styles.filterContent} ${!isOpen ? styles.collapsed : ''}`}>
                {displayedAmenities.map(amenity => (
                    <label key={amenity.id} className={styles.customCheckboxLabel}>
                        <input
                            type="checkbox"
                            checked={selectedAmenities.includes(amenity.id)}
                            onChange={(e) => onAmenityChange(amenity.id, e.target.checked)}
                        />
                        <span className={styles.checkmark}></span>
                        {translateAmenityName(amenity.name)}
                    </label>
                ))}
                {amenities.length > 5 && (
                    <button onClick={() => setShowAll(!showAll)} className={styles.viewAllLink}>
                        {showAll ? 'Thu gọn' : 'Xem tất cả'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AmenityFilter;