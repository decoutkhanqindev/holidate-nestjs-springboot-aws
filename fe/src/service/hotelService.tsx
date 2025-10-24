// import axios, { AxiosInstance } from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// // Tạo axios instance với cấu hình
// const createAxiosInstance = (): AxiosInstance => {
//     const instance = axios.create({
//         baseURL: API_BASE_URL,
//         timeout: 10000,
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     });

//     // Interceptor để thêm token nếu có
//     instance.interceptors.request.use(
//         (config) => {
//             const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//             if (token) {
//                 config.headers.Authorization = `Bearer ${token}`;
//             }
//             return config;
//         },
//         (error) => {
//             return Promise.reject(error);
//         }
//     );

//     // Interceptor để xử lý response lỗi
//     instance.interceptors.response.use(
//         (response) => response,
//         (error) => {
//             if (error.response?.status === 401) {
//                 // Token hết hạn hoặc không hợp lệ
//                 if (typeof window !== 'undefined') {
//                     localStorage.removeItem('token');
//                 }
//             }
//             return Promise.reject(error);
//         }
//     );

//     return instance;
// };

// export interface HotelPhoto {
//     id: string;
//     name: string;
//     photos: { id: string; url: string }[];
// }

// export interface HotelResponse {
//     id: string;
//     name: string;
//     description?: string;
//     address: string;
//     country: {
//         id: string;
//         name: string;
//         code: string;
//     };
//     province: {
//         id: string;
//         name: string;
//         code: string;
//     };
//     city: {
//         id: string;
//         name: string;
//         code: string;
//     };
//     district: {
//         id: string;
//         name: string;
//         code: string;
//     };
//     ward: {
//         id: string;
//         name: string;
//         code: string;
//     };
//     street: {
//         id: string;
//         name: string;
//         code: string;
//     };
//     photos: HotelPhoto[];
//     latitude: number;
//     longitude: number;
//     starRating: number;
//     averageScore: number;
//     allowsPayAtHotel: boolean;
//     partner: any;
//     status: string;
//     rawPricePerNight: number;
//     currentPricePerNight: number;
//     availableRooms: number;
//     createdAt?: string;
//     updatedAt?: string;
// }

// export interface ApiResponse<T> {
//     statusCode: number;
//     message: string;
//     data: T;
// }

// class HotelService {
//     private api: AxiosInstance;
//     private baseURL = '/accommodation/hotels';

//     constructor() {
//         this.api = createAxiosInstance();
//     }

//     async getAllHotels(): Promise<HotelResponse[]> {
//         try {
//             const response = await this.api.get<ApiResponse<HotelResponse[]>>(this.baseURL);
//             return response.data.data;
//         } catch (error) {
//             console.error('Error fetching hotels:', error);
//             throw new Error('Không thể tải danh sách khách sạn');
//         }
//     }

//     async getHotelsByCity(city: string): Promise<HotelResponse[]> {
//         try {
//             const response = await this.api.get<ApiResponse<HotelResponse[]>>(`${this.baseURL}?city=${encodeURIComponent(city)}`);
//             return response.data.data;
//         } catch (error) {
//             console.error('Error fetching hotels by city:', error);
//             throw new Error(`Không thể tải danh sách khách sạn tại ${city}`);
//         }
//     }

//     async getHotelById(id: string): Promise<HotelResponse> {
//         try {
//             const response = await this.api.get<ApiResponse<HotelResponse>>(`${this.baseURL}/${id}`);
//             return response.data.data;
//         } catch (error) {
//             console.error('Error fetching hotel by id:', error);
//             throw new Error('Không thể tải thông tin khách sạn');
//         }
//     }
// }


// src/service/hotelService.ts

import apiClient, { ApiResponse } from './apiClient';

// --- INTERFACES ---

export interface HotelPhoto {
    id: string;
    name: string;
    photos: { id: string; url: string }[];
}

export interface Amenity {
    id: string;
    name: string;
    free: boolean;
}

export interface AmenityGroup {
    id: string;
    name: string;
    amenities: Amenity[];
}

export interface EntertainmentVenue {
    id: string;
    name: string;
    distance: number;
}

export interface EntertainmentVenueGroup {
    id: string;
    name: string;
    entertainmentVenues: EntertainmentVenue[];
}

export interface HotelResponse {
    id: string;
    name: string;
    description?: string;
    address: string;
    country: { id: string; name: string; code: string; };
    province: { id: string; name: string; code: string; };
    city: { id: string; name: string; code: string; };
    district: { id: string; name: string; code: string; };
    ward: { id: string; name: string; code: string; };
    street: { id: string; name: string; code: string; };
    entertainmentVenues?: EntertainmentVenueGroup[];
    amenities?: AmenityGroup[];
    photos: HotelPhoto[];
    latitude: number;
    longitude: number;
    starRating: number;
    averageScore: number;
    allowsPayAtHotel: boolean;
    partner: any;
    status: string;
    rawPricePerNight: number;
    currentPricePerNight: number;
    availableRooms: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Room {
    id: string | number;
    name: string;
    view?: string;
    area: number;
    maxAdults: number;
    maxChildren?: number;
    basePricePerNight: number;
    bedType?: { id: string; name: string; };
    photos?: { id: string; name: string; photos: { id: string; url: string }[]; }[];
    amenities?: AmenityGroup[];
    quantity: number;
    status: string;
    cancellationPolicy?: any;
    reschedulePolicy?: any;
    smokingAllowed?: boolean;
    wifiAvailable?: boolean;
    breakfastIncluded?: boolean;
    createdAt?: string;
    updatedAt?: string | null;
}

export interface RoomDetailResponse extends Room {
    hotel: Omit<HotelResponse, 'photos' | 'description' | 'rawPricePerNight' | 'currentPricePerNight' | 'availableRooms'>;
}

export interface PaginatedData<T> {
    content: T[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface SearchParams {
    name?: string;
    city?: string;
    'city-id'?: string;
    district?: string;
    'district-id'?: string;
    province?: string;
    'province-id'?: string;
    page?: number;
    size?: number;
    sortBy?: 'price' | 'star-rating' | 'created-at';
    sortDir?: 'asc' | 'desc';
}

// --- CLASS SERVICE ---

class HotelService {
    private api = apiClient;
    private baseURL = '/accommodation/hotels';
    private roomsURL = '/accommodation/rooms';

    async searchHotels(params: SearchParams): Promise<PaginatedData<HotelResponse>> {
        try {
            const queryParams = new URLSearchParams(params as any);
            const response = await this.api.get<ApiResponse<PaginatedData<HotelResponse>>>(`${this.baseURL}?${queryParams.toString()}`);
            return response.data.data;
        } catch (error) {
            console.error('Error in searchHotels:', error);
            throw new Error('Không thể tìm kiếm khách sạn.');
        }
    }
    //;ấy khacsh sạn
    async getHotelById(id: string): Promise<HotelResponse> {
        try {
            const response = await this.api.get<ApiResponse<HotelResponse>>(`${this.baseURL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching hotel by id: ${id}`, error);
            throw new Error('Không thể tải thông tin khách sạn');
        }
    }
    // lấy phòng
    async getRoomsByHotelId(hotelId: string, page: number = 0, size: number = 10): Promise<PaginatedData<Room>> {
        try {
            const params = new URLSearchParams({
                'hotel-id': hotelId,
                page: page.toString(),
                size: size.toString(),
            });
            const response = await this.api.get<ApiResponse<PaginatedData<Room>>>(`${this.roomsURL}?${params.toString()}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching rooms for hotel id ${hotelId}:`, error);
            throw new Error('Không thể tải danh sách phòng.');
        }
    }

    // detail room
    async getRoomById(roomId: string): Promise<RoomDetailResponse> {
        try {
            const response = await this.api.get<ApiResponse<RoomDetailResponse>>(`${this.roomsURL}/${roomId}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching room by id: ${roomId}`, error);
            throw new Error('Không thể tải thông tin chi tiết phòng');
        }
    }
}

export const hotelService = new HotelService();