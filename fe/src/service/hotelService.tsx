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
    'hotel-id'?: string;
    'amenity-ids'?: string;
    'min-price'?: number;
    'max-price'?: number;
    adults?: string | number;
    children?: string | number;
    rooms?: string | number;
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

    /**
     * Tìm kiếm khách sạn với nhiều tham số
     * Hỗ trợ: province-id, city-id, district-id, hotel-id, name, amenities, price range
     */
    async searchHotels(params: SearchParams): Promise<PaginatedData<HotelResponse>> {
        try {
            // Lọc bỏ các tham số undefined/null
            const cleanParams: any = {};
            Object.keys(params).forEach(key => {
                const value = params[key as keyof SearchParams];
                if (value !== undefined && value !== null && value !== '') {
                    cleanParams[key] = String(value);
                }
            });

            const queryParams = new URLSearchParams(cleanParams);
            const url = `${this.baseURL}?${queryParams.toString()}`;

            console.log('[HotelService] Gọi API tìm kiếm với URL:', url);

            const response = await this.api.get<ApiResponse<PaginatedData<HotelResponse>>>(url);

            console.log('[HotelService] Kết quả trả về:', response.data.data);

            return response.data.data;
        } catch (error: any) {
            console.error('[HotelService] Lỗi khi tìm kiếm khách sạn:', error.response?.data || error.message);
            throw new Error('Không thể tìm kiếm khách sạn. Vui lòng thử lại.');
        }
    }

    /**
     * Lấy thông tin chi tiết 1 khách sạn theo ID
     */
    async getHotelById(id: string): Promise<HotelResponse> {
        try {
            console.log(`[HotelService] Lấy thông tin khách sạn ID: ${id}`);

            const response = await this.api.get<ApiResponse<HotelResponse>>(`${this.baseURL}/${id}`);

            console.log('[HotelService] Thông tin khách sạn:', response.data.data);

            return response.data.data;
        } catch (error: any) {
            console.error(`[HotelService] Lỗi khi lấy thông tin khách sạn ${id}:`, error.response?.data || error.message);
            throw new Error('Không thể tải thông tin khách sạn');
        }
    }

    /**
     * Lấy danh sách phòng của 1 khách sạn
     */
    async getRoomsByHotelId(hotelId: string, page: number = 0, size: number = 10): Promise<PaginatedData<Room>> {
        try {
            const params = new URLSearchParams({
                'hotel-id': hotelId,
                page: page.toString(),
                size: size.toString(),
            });

            console.log(`[HotelService] Lấy danh sách phòng của khách sạn ${hotelId}`);

            const response = await this.api.get<ApiResponse<PaginatedData<Room>>>(`${this.roomsURL}?${params.toString()}`);

            console.log('[HotelService] Danh sách phòng:', response.data.data);

            return response.data.data;
        } catch (error: any) {
            console.error(`[HotelService] Lỗi khi lấy danh sách phòng của hotel ${hotelId}:`, error.response?.data || error.message);
            throw new Error('Không thể tải danh sách phòng.');
        }
    }

    /**
     * Lấy thông tin chi tiết 1 phòng theo ID
     */
    async getRoomById(roomId: string): Promise<RoomDetailResponse> {
        try {
            console.log(`[HotelService] Lấy thông tin phòng ID: ${roomId}`);

            const response = await this.api.get<ApiResponse<RoomDetailResponse>>(`${this.roomsURL}/${roomId}`);

            console.log('[HotelService] Thông tin phòng:', response.data.data);

            return response.data.data;
        } catch (error: any) {
            console.error(`[HotelService] Lỗi khi lấy thông tin phòng ${roomId}:`, error.response?.data || error.message);
            throw new Error('Không thể tải thông tin chi tiết phòng');
        }
    }

    /**
     * Lấy tất cả khách sạn (không phân trang)
     * Chỉ dùng cho mục đích admin hoặc hiển thị danh sách nhỏ
     */
    async getAllHotels(): Promise<HotelResponse[]> {
        try {
            console.log('[HotelService] Lấy tất cả khách sạn');

            const response = await this.api.get<ApiResponse<HotelResponse[]>>(this.baseURL);

            return response.data.data;
        } catch (error: any) {
            console.error('[HotelService] Lỗi khi lấy tất cả khách sạn:', error.response?.data || error.message);
            throw new Error('Không thể tải danh sách khách sạn');
        }
    }

    /**
     * Tìm kiếm khách sạn theo tên
     * Wrapper function cho searchHotels
     */
    async searchByName(name: string, page: number = 0, size: number = 10): Promise<PaginatedData<HotelResponse>> {
        return this.searchHotels({ name, page, size });
    }

    /**
     * Tìm kiếm khách sạn theo thành phố
     * Wrapper function cho searchHotels
     */
    async searchByCity(cityId: string, page: number = 0, size: number = 10): Promise<PaginatedData<HotelResponse>> {
        return this.searchHotels({ 'city-id': cityId, page, size });
    }

    /**
     * Tìm kiếm khách sạn theo tỉnh
     * Wrapper function cho searchHotels
     */
    async searchByProvince(provinceId: string, page: number = 0, size: number = 10): Promise<PaginatedData<HotelResponse>> {
        return this.searchHotels({ 'province-id': provinceId, page, size });
    }

    /**
     * Tìm kiếm khách sạn theo quận
     * Wrapper function cho searchHotels
     */
    async searchByDistrict(districtId: string, page: number = 0, size: number = 10): Promise<PaginatedData<HotelResponse>> {
        return this.searchHotels({ 'district-id': districtId, page, size });
    }
}

export const hotelService = new HotelService();

// import apiClient, { ApiResponse } from './apiClient';

// // --- INTERFACES ---

// export interface HotelPhoto {
//     id: string;
//     name: string;
//     photos: { id: string; url: string }[];
// }

// export interface Amenity {
//     id: string;
//     name: string;
//     free: boolean;
// }

// export interface AmenityGroup {
//     id: string;
//     name: string;
//     amenities: Amenity[];
// }

// export interface EntertainmentVenue {
//     id: string;
//     name: string;
//     distance: number;
// }

// export interface EntertainmentVenueGroup {
//     id: string;
//     name: string;
//     entertainmentVenues: EntertainmentVenue[];
// }

// export interface HotelResponse {
//     id: string;
//     name: string;
//     description?: string;
//     address: string;
//     country: { id: string; name: string; code: string; };
//     province: { id: string; name: string; code: string; };
//     city: { id: string; name: string; code: string; };
//     district: { id: string; name: string; code: string; };
//     ward: { id: string; name: string; code: string; };
//     street: { id: string; name: string; code: string; };
//     entertainmentVenues?: EntertainmentVenueGroup[];
//     amenities?: AmenityGroup[];
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

// export interface Room {
//     id: string | number;
//     name: string;
//     view?: string;
//     area: number;
//     maxAdults: number;
//     maxChildren?: number;
//     basePricePerNight: number;
//     bedType?: { id: string; name: string; };
//     photos?: { id: string; name: string; photos: { id: string; url: string }[]; }[];
//     amenities?: AmenityGroup[];
//     quantity: number;
//     status: string;
//     cancellationPolicy?: any;
//     reschedulePolicy?: any;
//     smokingAllowed?: boolean;
//     wifiAvailable?: boolean;
//     breakfastIncluded?: boolean;
//     createdAt?: string;
//     updatedAt?: string | null;
// }

// export interface RoomDetailResponse extends Room {
//     hotel: Omit<HotelResponse, 'photos' | 'description' | 'rawPricePerNight' | 'currentPricePerNight' | 'availableRooms'>;
// }

// export interface PaginatedData<T> {
//     content: T[];
//     page: number;
//     size: number;
//     totalItems: number;
//     totalPages: number;
//     last: boolean;
//     first: boolean;
//     hasNext: boolean;
//     hasPrevious: boolean;
// }

// export interface SearchParams {
//     name?: string;
//     city?: string;
//     'city-id'?: string;
//     district?: string;
//     'district-id'?: string;
//     'hotel-id'?: string;
//     province?: string;
//     'province-id'?: string;
//     page?: number;
//     size?: number;
//     sortBy?: 'price' | 'star-rating' | 'created-at';
//     sortDir?: 'asc' | 'desc';
// }

// // --- CLASS SERVICE ---

// class HotelService {
//     private api = apiClient;
//     private baseURL = '/accommodation/hotels';
//     private roomsURL = '/accommodation/rooms';

//     async searchHotels(params: SearchParams): Promise<PaginatedData<HotelResponse>> {
//         try {
//             const queryParams = new URLSearchParams(params as any);
//             const response = await this.api.get<ApiResponse<PaginatedData<HotelResponse>>>(`${this.baseURL}?${queryParams.toString()}`);
//             return response.data.data;
//         } catch (error) {
//             console.error('Error in searchHotels:', error);
//             throw new Error('Không thể tìm kiếm khách sạn.');
//         }
//     }
//     //;ấy khacsh sạn
//     async getHotelById(id: string): Promise<HotelResponse> {
//         try {
//             const response = await this.api.get<ApiResponse<HotelResponse>>(`${this.baseURL}/${id}`);
//             return response.data.data;
//         } catch (error) {
//             console.error(`Error fetching hotel by id: ${id}`, error);
//             throw new Error('Không thể tải thông tin khách sạn');
//         }
//     }
//     // lấy phòng
//     async getRoomsByHotelId(hotelId: string, page: number = 0, size: number = 10): Promise<PaginatedData<Room>> {
//         try {
//             const params = new URLSearchParams({
//                 'hotel-id': hotelId,
//                 page: page.toString(),
//                 size: size.toString(),
//             });
//             const response = await this.api.get<ApiResponse<PaginatedData<Room>>>(`${this.roomsURL}?${params.toString()}`);
//             return response.data.data;
//         } catch (error) {
//             console.error(`Error fetching rooms for hotel id ${hotelId}:`, error);
//             throw new Error('Không thể tải danh sách phòng.');
//         }
//     }

//     // detail room
//     async getRoomById(roomId: string): Promise<RoomDetailResponse> {
//         try {
//             const response = await this.api.get<ApiResponse<RoomDetailResponse>>(`${this.roomsURL}/${roomId}`);
//             return response.data.data;
//         } catch (error) {
//             console.error(`Error fetching room by id: ${roomId}`, error);
//             throw new Error('Không thể tải thông tin chi tiết phòng');
//         }
//     }
// }

// export const hotelService = new HotelService();