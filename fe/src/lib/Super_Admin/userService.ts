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
        // Fetch TẤT CẢ users từ backend (không dùng pagination params)
        // Frontend sẽ tự phân trang để hiển thị 10 items mỗi trang
        const usersResponse = await apiClient.get<ApiResponse<UserResponse[] | PaginatedUserResponse>>(
            baseURL
        );

        let allUsers: UserResponse[] = [];

        // Kiểm tra xem response có phải là paginated không
        if (usersResponse.data?.statusCode === 200) {
            const responseData = usersResponse.data.data;
            
            // Kiểm tra xem có phải là paginated response không
            if (Array.isArray(responseData)) {
                // Không phải paginated, trả về array trực tiếp
                allUsers = responseData;
            } else if (responseData && typeof responseData === 'object' && 'content' in responseData) {
                // Là paginated response từ backend - lấy tất cả content
                const paginatedData = responseData as PaginatedUserResponse;
                allUsers = paginatedData.content;
            }
        }

        // Filter users với role USER (customer)
        const customerUsers = allUsers.filter(
            user => user.role?.name?.toUpperCase() === 'USER'
        );

        // Phân trang ở frontend: chỉ lấy 10 items cho trang hiện tại
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

