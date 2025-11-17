// service/reviewService.ts
import apiClient, { ApiResponse } from './apiClient';
import type { Review } from '@/types';

// Interface từ API response
interface ReviewResponse {
    id: string;
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
    hotelId?: string;
    hotel?: {
        id: string;
        name: string;
    };
    user?: {
        id: string;
        fullName: string;
        avatarUrl?: string;
    };
    score: number;
    comment?: string;
    photos?: Array<{
        id: string;
        url: string;
        category?: string;
    }>;
    createdAt: string;
    updatedAt?: string;
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
}

export interface PaginatedReviewsResult {
    data: Review[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface CreateReviewPayload {
    bookingId: string;
    score: number; // 1-10
    comment?: string;
    photos?: File[];
}

function mapReviewResponseToReview(response: ReviewResponse): Review {
    let userId = '';
    let userName = 'Không xác định';
    let userAvatar: string | undefined = undefined;
    
    if (response.user) {
        userId = response.user.id || '';
        userName = response.user.fullName || 'Không xác định';
        userAvatar = response.user.avatarUrl;
    }
    
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
        hotelName = 'N/A';
    }
    
    let roomId = '';
    let roomName = 'N/A';
    
    if (response.booking?.room) {
        roomId = response.booking.room.id;
        roomName = response.booking.room.name;
    }
    
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

        const response = await apiClient.get<ApiResponse<PaginatedReviewResponse>>('/reviews', {
            params: queryParams
        });

        if (response.data?.statusCode === 200 && response.data?.data) {
            const reviews = response.data.data.content.map(mapReviewResponseToReview);
            
            return {
                data: reviews,
                totalPages: response.data.data.totalPages,
                currentPage: response.data.data.page,
                totalItems: response.data.data.totalItems,
                hasNext: response.data.data.hasNext,
                hasPrevious: response.data.data.hasPrevious,
            };
        }

        return {
            data: [],
            totalPages: 0,
            currentPage: 0,
            totalItems: 0,
            hasNext: false,
            hasPrevious: false,
        };
    } catch (error: any) {
        console.error("[reviewService] Error fetching reviews:", error);
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Không thể tải danh sách đánh giá';
        throw new Error(errorMessage);
    }
}

/**
 * Lấy chi tiết một review theo ID
 */
export async function getReviewById(reviewId: string): Promise<Review> {
    try {
        const response = await apiClient.get<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}`);

        if (response.data?.statusCode === 200 && response.data?.data) {
            return mapReviewResponseToReview(response.data.data);
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

/**
 * Tạo review mới
 */
export async function createReview(payload: CreateReviewPayload): Promise<Review> {
    try {
        const formData = new FormData();
        formData.append('bookingId', payload.bookingId);
        formData.append('score', payload.score.toString());
        
        if (payload.comment) {
            formData.append('comment', payload.comment);
        }
        
        if (payload.photos && payload.photos.length > 0) {
            payload.photos.forEach((photo) => {
                formData.append('photos', photo);
            });
        }

        const response = await apiClient.post<ApiResponse<ReviewResponse>>('/reviews', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data?.statusCode === 200 && response.data?.data) {
            return mapReviewResponseToReview(response.data.data);
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error("[reviewService] Error creating review:", error);
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Không thể tạo đánh giá';
        throw new Error(errorMessage);
    }
}

/**
 * Cập nhật review
 */
export async function updateReview(
    reviewId: string,
    payload: {
        score?: number;
        comment?: string;
        photosToAdd?: File[];
        photoIdsToDelete?: string[];
    }
): Promise<Review> {
    try {
        const formData = new FormData();
        
        if (payload.score !== undefined) {
            formData.append('score', payload.score.toString());
        }
        
        if (payload.comment !== undefined) {
            formData.append('comment', payload.comment);
        }
        
        if (payload.photosToAdd && payload.photosToAdd.length > 0) {
            payload.photosToAdd.forEach((photo) => {
                formData.append('photosToAdd', photo);
            });
        }
        
        if (payload.photoIdsToDelete && payload.photoIdsToDelete.length > 0) {
            payload.photoIdsToDelete.forEach((photoId) => {
                formData.append('photoIdsToDelete', photoId);
            });
        }

        const response = await apiClient.put<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data?.statusCode === 200 && response.data?.data) {
            return mapReviewResponseToReview(response.data.data);
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error("[reviewService] Error updating review:", error);
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Không thể cập nhật đánh giá';
        throw new Error(errorMessage);
    }
}

/**
 * Xóa review
 */
export async function deleteReview(reviewId: string): Promise<void> {
    try {
        await apiClient.delete<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}`);
    } catch (error: any) {
        console.error("[reviewService] Error deleting review:", error);
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Không thể xóa đánh giá';
        throw new Error(errorMessage);
    }
}















