// lib/Super_Admin/userService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';

const baseURL = '/users';

// Interface từ API response
interface UserResponse {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
    country?: { id: string; name: string };
    province?: { id: string; name: string };
    city?: { id: string; name: string };
    district?: { id: string; name: string };
    ward?: { id: string; name: string };
    street?: { id: string; name: string };
    gender?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
    role: {
        id: string;
        name: string;
        description?: string;
    };
    authInfo?: {
        provider: string;
        verified: boolean;
    };
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface PaginatedUserResponse {
    content: UserResponse[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface CustomerUser {
    id: string;
    userId: string; // UUID string
    fullName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    avatarUrl?: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: Date;
    updatedAt?: Date;
}

function mapUserResponseToCustomerUser(user: UserResponse): CustomerUser {
    return {
        id: user.id, // UUID string
        userId: user.id, // UUID string
        fullName: user.fullName || user.email,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        avatarUrl: user.avatarUrl,
        status: user.active === false ? 'INACTIVE' : 'ACTIVE',
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
    };
}

/**
 * Lấy danh sách Customer Users (users với role USER)
 * Hàm này sẽ gọi API nhiều lần nếu cần để lấy TẤT CẢ users từ backend
 */
export async function getCustomerUsers({
    page = 1,
    limit = 10
}: {
    page?: number;
    limit?: number
}): Promise<{
    data: CustomerUser[];
    totalPages: number;
    totalItems: number;
    currentPage: number;
}> {
    try {
        // Backend giới hạn size tối đa là 100, nên ta sẽ gọi với size=100
        // và gọi nhiều lần nếu cần để lấy hết tất cả users
        const MAX_PAGE_SIZE = 100;
        let allUsers: UserResponse[] = [];
        let currentPageBackend = 0;
        let hasMore = true;

        // Lặp để lấy tất cả users từ backend
        while (hasMore) {
            const usersResponse = await apiClient.get<ApiResponse<PaginatedUserResponse | UserResponse[]>>(
                `${baseURL}?page=${currentPageBackend}&size=${MAX_PAGE_SIZE}`
            );

            if (usersResponse.data?.statusCode === 200 && usersResponse.data?.data) {
                const responseData = usersResponse.data.data;
                
                // Kiểm tra xem response có phải là paginated không
                if (Array.isArray(responseData)) {
                    // Trường hợp backend trả về array trực tiếp (không paginated)
                    allUsers = [...allUsers, ...responseData];
                    hasMore = false; // Không còn page nào nữa
                } else if (responseData && typeof responseData === 'object' && 'content' in responseData) {
                    // Trường hợp paginated response
                    const paginatedData = responseData as PaginatedUserResponse;
                    
                    // Thêm users từ page hiện tại vào danh sách
                    if (paginatedData.content && paginatedData.content.length > 0) {
                        allUsers = [...allUsers, ...paginatedData.content];
                    }

                    // Kiểm tra xem còn page nào nữa không
                    hasMore = paginatedData.hasNext === true && !paginatedData.last;
                    currentPageBackend++;
                } else {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
            
            // Giới hạn số lần gọi API để tránh vòng lặp vô hạn (tối đa 1000 pages = 100,000 users)
            if (currentPageBackend >= 1000) {
                hasMore = false;
            }
        }

        // Filter users với role USER (customer) - kiểm tra cả uppercase và lowercase
        const customerUsers = allUsers.filter(
            user => {
                const roleName = user.role?.name?.toUpperCase();
                return roleName === 'USER' || roleName === 'CUSTOMER';
            }
        );

        // Phân trang ở frontend: chỉ lấy items cho trang hiện tại
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedCustomerUsers = customerUsers.slice(start, end);

        // Map sang CustomerUser
        const mappedUsers = paginatedCustomerUsers.map(user => mapUserResponseToCustomerUser(user));

        // Tính totalPages từ tổng số USER users
        const totalItems = customerUsers.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));

        return {
            data: mappedUsers,
            totalPages,
            totalItems,
            currentPage: page,
        };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tải danh sách người dùng';
        throw new Error(errorMessage);
    }
}

