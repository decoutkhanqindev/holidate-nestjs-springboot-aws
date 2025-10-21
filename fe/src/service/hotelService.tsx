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

// export const hotelService = new HotelService();


import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 15000,
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


// --- CÁC INTERFACE ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU ---

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
    area: number;
    maxAdults: number;
    basePricePerNight: number;
    bedType?: { name: string; };
    photos?: {
        photos: { url: string }[];
    }[];
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

// Interface mới cho dữ liệu có phân trang
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

// Interface mới cho các tham số tìm kiếm
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



class HotelService {
    private api: AxiosInstance;
    private baseURL = '/accommodation/hotels';

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

    async getRoomsByHotelId(hotelId: string): Promise<Room[]> {
        try {
            const response = await this.api.get<ApiResponse<Room[]>>(`/accommodation/rooms/hotel/${hotelId}`);
            return response.data?.data || [];
        } catch (error) {
            console.error(`Error fetching rooms for hotel id ${hotelId}:`, error);
            return [];
        }
    }
}

export const hotelService = new HotelService();