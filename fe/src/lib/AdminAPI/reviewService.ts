// lib/AdminAPI/reviewService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';
import type { Review } from '@/types';

// Interface từ API response
// GET All Reviews có thể trả về simplified version (không có booking/hotel/room)
// GET Review By ID và Create Review có đầy đủ thông tin
interface ReviewResponse {
    id: string;
    // Có thể có hoặc không (trong GET All Reviews có thể không có)
    booking?: {
        id: string;
        hotel?: {
            id: string;
            name: string;
        };
        room?: {
            id: string;
            name: string;
        };
    };
    // Có thể có hotelId trực tiếp (nếu không có booking)
    hotelId?: string;
    hotel?: {
        id: string;
        name: string;
    };
    // GET All Reviews có thể không có user (simplified version)
    user?: {
        id: string;
        fullName: string;
        avatarUrl?: string;
    };
    score: number; // 1-10
    comment?: string;
    photos?: Array<{
        id: string;
        url: string;
        category?: string;
    }>;
    createdAt: string; // ISO datetime
    updatedAt?: string; // ISO datetime
}

interface PaginatedReviewResponse {
    content: ReviewResponse[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Interface cho query parameters
export interface GetReviewsParams {
    hotelId?: string;
    userId?: string;
    bookingId?: string;
    minScore?: number;
    maxScore?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
    roleName?: string; // Để log
    currentUserId?: string; // Để log
}

// Interface cho kết quả trả về
export interface PaginatedReviewsResult {
    data: Review[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}

/**
 * Map từ ReviewResponse sang Review (frontend type)
 * GET All Reviews trả về simplified version (không có user, booking)
 */
function mapReviewResponseToReview(response: ReviewResponse): Review {
    // Xử lý user - có thể không có trong simplified response
    let userId = '';
    let userName = 'Không xác định';
    let userAvatar: string | undefined = undefined;
    
    if (response.user) {
        userId = response.user.id || '';
        userName = response.user.fullName || 'Không xác định';
        userAvatar = response.user.avatarUrl;
    }
    
    // Xử lý hotelId và hotelName - có thể từ booking.hotel hoặc hotel trực tiếp
    let hotelId = '';
    let hotelName = 'N/A';
    
    if (response.booking?.hotel) {
        hotelId = response.booking.hotel.id;
        hotelName = response.booking.hotel.name;
    } else if (response.hotel) {
        hotelId = response.hotel.id;
        hotelName = response.hotel.name;
    } else if (response.hotelId) {
        hotelId = response.hotelId;
        hotelName = 'N/A'; // Không có tên trong response
    }
    
    // Xử lý roomId và roomName
    let roomId = '';
    let roomName = 'N/A';
    
    if (response.booking?.room) {
        roomId = response.booking.room.id;
        roomName = response.booking.room.name;
    }
    
    // Xử lý bookingId
    const bookingId = response.booking?.id || '';
    
    return {
        id: response.id,
        userId: userId,
        userName: userName,
        userAvatar: userAvatar,
        hotelId: hotelId,
        hotelName: hotelName,
        roomId: roomId,
        roomName: roomName,
        bookingId: bookingId,
        score: response.score,
        comment: response.comment,
        photos: response.photos?.map(photo => ({
            id: photo.id,
            url: photo.url
        })),
        createdAt: new Date(response.createdAt),
        updatedAt: response.updatedAt ? new Date(response.updatedAt) : undefined,
    };
}

/**
 * Lấy danh sách reviews với phân trang
 */
export async function getReviews(params: GetReviewsParams = {}): Promise<PaginatedReviewsResult> {
    try {
        // Backend dùng camelCase cho query params
        const queryParams: Record<string, string | number> = {};
        
        if (params.hotelId) queryParams.hotelId = params.hotelId;
        if (params.userId) queryParams.userId = params.userId;
        if (params.bookingId) queryParams.bookingId = params.bookingId;
        if (params.minScore !== undefined) queryParams.minScore = params.minScore;
        if (params.maxScore !== undefined) queryParams.maxScore = params.maxScore;
        if (params.page !== undefined) queryParams.page = params.page;
        if (params.size !== undefined) queryParams.size = params.size;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.sortDir) queryParams.sortDir = params.sortDir;

        console.log("[reviewService] Fetching reviews with params:", {
            ...queryParams,
            roleName: params.roleName,
            currentUserId: params.currentUserId,
        });

        const response = await apiClient.get<ApiResponse<PaginatedReviewResponse>>('/reviews', {
            params: queryParams
        });

        console.log("[reviewService] Response received:", {
            status: response.status,
            totalItems: response.data?.data?.totalItems,
            page: response.data?.data?.page,
            totalPages: response.data?.data?.totalPages,
        });

        if (response.data?.statusCode === 200 && response.data?.data) {
            let reviews = response.data.data.content.map(mapReviewResponseToReview);
            
            console.log("[reviewService] Mapped reviews:", reviews.length);
            
            // Nếu review thiếu thông tin user/hotel/room, fetch chi tiết
            // Chỉ fetch những review thiếu thông tin quan trọng (giới hạn 5 reviews để tránh quá nhiều requests)
            const reviewsNeedingDetails = reviews.filter(r => 
                (!r.userName || r.userName === 'Không xác định' || 
                 !r.hotelName || r.hotelName === 'N/A' ||
                 !r.roomName || r.roomName === 'N/A') && 
                r.id // Đảm bảo có ID
            ).slice(0, 5); // Giới hạn tối đa 5 reviews
            
            if (reviewsNeedingDetails.length > 0) {
                console.log("[reviewService] Fetching details for", reviewsNeedingDetails.length, "reviews that need full info");
                try {
                    const detailedReviews = await Promise.allSettled(
                        reviewsNeedingDetails.map(r => getReviewById(r.id))
                    );
                    
                    // Cập nhật reviews với thông tin chi tiết
                    detailedReviews.forEach((result, idx) => {
                        if (result.status === 'fulfilled') {
                            const detailedReview = result.value;
                            const originalIndex = reviews.findIndex(r => r.id === detailedReview.id);
                            if (originalIndex !== -1) {
                                reviews[originalIndex] = detailedReview;
                                console.log(`[reviewService] ✅ Updated review ${detailedReview.id} with full details`);
                            }
                        } else {
                            console.warn(`[reviewService] ⚠️ Failed to fetch details for review ${reviewsNeedingDetails[idx].id}:`, result.reason);
                        }
                    });
                } catch (error) {
                    console.error("[reviewService] Error fetching review details:", error);
                    // Không throw error, tiếp tục với simplified data
                }
            }
            
            return {
                data: reviews,
                totalPages: response.data.data.totalPages,
                currentPage: response.data.data.page,
                totalItems: response.data.data.totalItems,
            };
        }

        // Nếu response không có data hoặc statusCode không phải 200
        console.warn("[reviewService] Unexpected response structure:", response.data);
        return {
            data: [],
            totalPages: 0,
            currentPage: 0,
            totalItems: 0,
        };
    } catch (error: any) {
        console.error("[reviewService] Error fetching reviews:", error);
        console.error("[reviewService] Error response status:", error.response?.status);
        console.error("[reviewService] Error response data:", error.response?.data);
        
        // Nếu là lỗi 401 hoặc 403, có thể do authentication
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
        }

        // Lấy message từ backend nếu có
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Không thể tải danh sách đánh giá';
        
        throw new Error(errorMessage);
    }
}

/**
 * Lấy chi tiết một review theo ID (có đầy đủ thông tin user, booking, hotel, room)
 */
export async function getReviewById(reviewId: string): Promise<Review> {
    try {
        console.log("[reviewService] Fetching review details:", reviewId);

        const response = await apiClient.get<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}`);

        if (response.data?.statusCode === 200 && response.data?.data) {
            const review = mapReviewResponseToReview(response.data.data);
            console.log("[reviewService] Review details fetched:", review);
            return review;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error("[reviewService] Error fetching review details:", error);
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Không thể tải chi tiết đánh giá';
        throw new Error(errorMessage);
    }
}

