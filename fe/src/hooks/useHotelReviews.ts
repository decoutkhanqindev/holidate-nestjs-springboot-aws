// hooks/useHotelReviews.ts
import { useState, useEffect } from 'react';
import { getReviews } from '@/service/reviewService';

export interface HotelReviewsStats {
    averageScore: number;
    totalReviews: number;
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook để lấy thống kê reviews của một khách sạn
 */
export function useHotelReviews(hotelId: string | null | undefined): HotelReviewsStats {
    const [stats, setStats] = useState<HotelReviewsStats>({
        averageScore: 0,
        totalReviews: 0,
        isLoading: false,
        error: null,
    });

    useEffect(() => {
        if (!hotelId) {
            setStats({
                averageScore: 0,
                totalReviews: 0,
                isLoading: false,
                error: null,
            });
            return;
        }

        let cancelled = false;

        const fetchStats = async () => {
            setStats(prev => ({ ...prev, isLoading: true, error: null }));
            try {
                // Fetch reviews để tính averageScore thực tế
                // Tối ưu: Fetch 1 page (10 reviews) để tính averageScore nhanh
                // Nếu có nhiều reviews, sẽ tính từ 10 reviews đầu (có thể không chính xác 100%)
                const result = await getReviews({
                    hotelId,
                    page: 0,
                    size: 10, // Chỉ fetch 10 reviews đầu để tính averageScore
                    sortBy: 'createdAt',
                    sortDir: 'DESC',
                });

                if (cancelled) return;

                const reviews = result.data;
                const totalItems = result.totalItems;

                if (totalItems === 0 || reviews.length === 0) {
                    setStats({
                        averageScore: 0,
                        totalReviews: 0,
                        isLoading: false,
                        error: null,
                    });
                    return;
                }

                // Tính averageScore từ reviews đã fetch
                // LƯU Ý: Nếu có nhiều hơn 10 reviews, averageScore này chỉ tính từ 10 reviews đầu
                // Để chính xác 100%, cần fetch tất cả reviews nhưng sẽ tốn nhiều API calls
                const totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
                const averageScore = totalScore / reviews.length;

                setStats({
                    averageScore: Math.round(averageScore * 10) / 10, // Làm tròn 1 chữ số thập phân
                    totalReviews: totalItems,
                    isLoading: false,
                    error: null,
                });
            } catch (error: any) {
                if (cancelled) return;
                console.error('[useHotelReviews] Error fetching reviews:', error);
                // Không hiển thị lỗi, chỉ trả về stats rỗng
                setStats({
                    averageScore: 0,
                    totalReviews: 0,
                    isLoading: false,
                    error: null, // Ẩn lỗi để không làm gián đoạn UI
                });
            }
        };

        fetchStats();

        return () => {
            cancelled = true;
        };
    }, [hotelId]);

    return stats;
}

