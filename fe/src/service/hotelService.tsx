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



import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 35000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    instance.interceptors.request.use(
        (config) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                console.error("Unauthorized access - 401. Clearing token.");
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};


// ---  INTERFACE   CẤU TRÚC DỮ LIỆU ---

export interface HotelPhoto {
    id: string;
    name: string;
    photos: { id: string; url: string }[];
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

export interface Amenity { id: string; name: string; free: boolean; }
export interface AmenityGroup { id: string; name: string; amenities: Amenity[]; }
// Interface   địa điểm giải trí
export interface EntertainmentVenue {
    id: string;
    name: string;
    distance: number;
}

// Interface  nhóm địa điểm giải trí
export interface EntertainmentVenueGroup {
    id: string;
    name: string;
    entertainmentVenues: EntertainmentVenue[];
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

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

// Interface  cho dữ liệu có phân trang
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

// Interface  cho các tham số tìm kiếm
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


export interface RoomDetailResponse extends Room {
    hotel: Omit<HotelResponse, 'photos' | 'description' | 'rawPricePerNight' | 'currentPricePerNight' | 'availableRooms'>;

}
class HotelService {
    private api: AxiosInstance;
    private baseURL = '/accommodation/hotels';
    private roomsURL = '/accommodation/rooms';

    constructor() {
        this.api = createAxiosInstance();
    }

    async searchHotels(params: SearchParams): Promise<PaginatedData<HotelResponse>> {
        try {
            const queryParams = new URLSearchParams();
            const typedParams = params as { [key: string]: any };

            for (const key in typedParams) {
                const value = typedParams[key];
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.set(key, value.toString());
                }
            }

            const response = await this.api.get<ApiResponse<PaginatedData<HotelResponse>>>(`${this.baseURL}?${queryParams.toString()}`);
            return response.data.data;

        } catch (error) {
            console.error('Error in searchHotels:', error);
            return { content: [], page: 0, size: 10, totalItems: 0, totalPages: 0, last: true, first: true, hasNext: false, hasPrevious: false };
        }
    }

    async getAllHotels(): Promise<HotelResponse[]> {
        try {
            const response = await this.api.get<ApiResponse<PaginatedData<HotelResponse>>>(this.baseURL);
            return response.data.data.content;
        } catch (error) {
            console.error('Error fetching hotels:', error);
            return [];
        }
    }

    async getHotelById(id: string): Promise<HotelResponse> {
        try {
            const response = await this.api.get<ApiResponse<HotelResponse>>(`${this.baseURL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching hotel by id: ${id}`, error);
            throw new Error('Không thể tải thông tin khách sạn');
        }
    }

    async getRoomsByHotelId(hotelId: string, page: number = 0, size: number = 5): Promise<PaginatedData<Room>> {
        const requestUrl = `/accommodation/rooms?hotel-id=${hotelId}&page=${page}&size=${size}`;
        console.log(`[hotelService] Bắt đầu gọi API lấy phòng: ${requestUrl}`); // << THÊM LOG
        try {
            const params = new URLSearchParams({
                'hotel-id': hotelId,
                page: page.toString(),
                size: size.toString(),
            });
            const response = await this.api.get<ApiResponse<PaginatedData<Room>>>(`/accommodation/rooms?${params.toString()}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching rooms for hotel id ${hotelId}:`, error);
            return { content: [], page: 0, size, totalItems: 0, totalPages: 0, last: true, first: true, hasNext: false, hasPrevious: false };
        }
    }

    async getAmenitiesByHotelId(hotelId: string): Promise<AmenityGroup[]> {
        try {
            const response = await this.api.get<ApiResponse<AmenityGroup[]>>(`${this.baseURL}/${hotelId}/amenities`);
            return response.data?.data || [];
        } catch (error) {
            console.error(`Error fetching amenities for hotel id ${hotelId}:`, error);
            return [];
        }
    }
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