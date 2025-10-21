
import apiClient from './api';
import { AxiosInstance } from 'axios';

export interface Amenity {
    id: string;
    name: string;
    free: boolean;
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

class AmenityService {
    private api: AxiosInstance;
    private baseURL = '/amenity/amenities';

    constructor() {
        this.api = apiClient;
    }

    /**
     * Lấy tất cả các tiện nghi có sẵn trong hệ thống
     */
    async getAllAmenities(): Promise<Amenity[]> {
        try {
            const response = await this.api.get<ApiResponse<Amenity[]>>(this.baseURL);
            // Lọc bỏ những dữ liệu không hợp lệ nếu có
            return response.data.data.filter(amenity => !amenity.id.startsWith('SET @hotel_id'));
        } catch (error) {
            console.error('Lỗi khi tải danh sách tiện nghi:', error);
            throw new Error('Không thể tải danh sách tiện nghi');
        }
    }
}

export const amenityService = new AmenityService();