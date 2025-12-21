"use client";

import { useState, useEffect, useRef } from 'react';
import { useHotelReviews } from '@/hooks/useHotelReviews';
import styles from './ReviewStats.module.css';

interface ReviewStatsProps {
    hotelId: string;
    showDetailed?: boolean; // Hiển thị chi tiết (số lượng reviews)
    lazyLoad?: boolean; // Chỉ fetch khi component visible
}

export default function ReviewStats({ hotelId, showDetailed = false, lazyLoad = false }: ReviewStatsProps) {
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

    if (isLoading) {
        return (
            <div className={styles.statsContainer}>
                <span className={styles.loading}>Đang tải...</span>
            </div>
        );
    }

    // Ẩn nếu có lỗi hoặc đang loading
    if (error) {
        return null; // Ẩn nếu có lỗi để không làm gián đoạn UI
    }

    // Hiển thị "Chưa có đánh giá" nếu không có reviews
    if (!isLoading && totalReviews === 0) {
        return (
            <div className={styles.statsContainer}>
                <span className={styles.noReviews}>Chưa có đánh giá</span>
            </div>
        );
    }

    // Chỉ hiển thị stats nếu có reviews và averageScore > 0
    if (!isLoading && averageScore === 0 && totalReviews > 0) {
        return null; // Có reviews nhưng averageScore = 0 (không hợp lệ)
    }

    const getRatingText = (score: number) => {
        if (score >= 9.0) return 'Xuất sắc';
        if (score >= 8.5) return 'Rất tốt';
        if (score >= 8.0) return 'Tốt';
        if (score >= 7.0) return 'Khá';
        return 'Bình thường';
    };

    const fullStars = Math.floor(averageScore);
    const hasHalfStar = averageScore % 1 >= 0.5;
    const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div ref={ref} className={styles.statsContainer}>
            <div className={styles.ratingBadge}>
                <span className={styles.scoreValue}>{averageScore.toFixed(1)}</span>
            </div>
            <div className={styles.ratingInfo}>
                <div className={styles.stars}>
                    {Array.from({ length: fullStars }).map((_, i) => (
                        <span key={i} className={styles.starFull}>★</span>
                    ))}
                    {hasHalfStar && <span className={styles.starHalf}>☆</span>}
                    {Array.from({ length: emptyStars }).map((_, i) => (
                        <span key={i} className={styles.starEmpty}>★</span>
                    ))}
                </div>
                <span className={styles.ratingText}>{getRatingText(averageScore)}</span>
                {showDetailed && (
                    <span className={styles.reviewCount}>({totalReviews} đánh giá)</span>
                )}
            </div>
        </div>
    );
}

