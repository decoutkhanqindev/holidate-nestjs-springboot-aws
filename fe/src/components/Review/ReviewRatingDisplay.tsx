"use client";

import { useState, useEffect, useRef } from 'react';
import { useHotelReviews } from '@/hooks/useHotelReviews';
import styles from './ReviewRatingDisplay.module.css';

interface ReviewRatingDisplayProps {
    hotelId: string;
    categoryLabel?: string; // Nhãn loại (mặc định: "Khách sạn")
    lazyLoad?: boolean; // Chỉ fetch khi component visible
    showLabel?: boolean; // Hiển thị text "đánh giá" phía trên
}

/**
 * Component hiển thị đánh giá theo format: category badge + star rating (1-5 sao)
 * Mỗi hotel sẽ có đánh giá riêng được fetch từ API
 */
export default function ReviewRatingDisplay({ 
    hotelId, 
    categoryLabel = "Khách sạn",
    lazyLoad = false,
    showLabel = false
}: ReviewRatingDisplayProps) {
    const [isVisible, setIsVisible] = useState(!lazyLoad);
    const ref = useRef<HTMLDivElement>(null);
    
    // Chỉ fetch khi component visible hoặc không lazy load
    const { averageScore, totalReviews, isLoading, error } = useHotelReviews(isVisible ? hotelId : null);

    // Lazy load: chỉ fetch khi component visible
    useEffect(() => {
        if (!lazyLoad || isVisible) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [lazyLoad, isVisible]);

    // Convert averageScore (1-10) to starRating (1-5)
    const convertToStarRating = (score: number): number => {
        if (score <= 0) return 0;
        // Formula: (averageScore / 10) * 5, rounded
        const starRating = Math.round((score / 10) * 5);
        // Ensure star rating is between 1-5
        return Math.max(1, Math.min(5, starRating));
    };

    if (isLoading) {
        return (
            <div ref={ref} className={styles.container}>
                {showLabel && <div className={styles.labelText}>đánh giá</div>}
                <div className={styles.loadingContainer}>
                    <span className={styles.loading}>Đang tải...</span>
                </div>
            </div>
        );
    }

    // Ẩn nếu có lỗi
    if (error) {
        return null;
    }

    // Hiển thị "Chưa có đánh giá" nếu không có reviews
    if (!isLoading && totalReviews === 0) {
        return (
            <div ref={ref} className={styles.container}>
                {showLabel && <div className={styles.labelText}>đánh giá</div>}
                <div className={styles.noReviewsContainer}>
                    <span className={styles.categoryBadge}>{categoryLabel}</span>
                    <span className={styles.noReviews}>Chưa có đánh giá</span>
                </div>
            </div>
        );
    }

    // Chỉ hiển thị stats nếu có reviews và averageScore > 0
    if (!isLoading && averageScore === 0 && totalReviews > 0) {
        return null;
    }

    const starRating = convertToStarRating(averageScore);

    return (
        <div ref={ref} className={styles.container}>
            {showLabel && <div className={styles.labelText}>đánh giá</div>}
            <div className={styles.ratingContainer}>
                <span className={styles.categoryBadge}>{categoryLabel}</span>
                <div className={styles.starRating}>
                    <span className={styles.starNumber}>{starRating}</span>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        fill="currentColor" 
                        viewBox="0 0 16 16" 
                        className={styles.starIcon}
                    >
                        <path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}



































