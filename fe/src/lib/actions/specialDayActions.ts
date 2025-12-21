'use server';

import { revalidatePath } from 'next/cache';
import type { CreateSpecialDayPayload, UpdateSpecialDayPayload, SpecialDay } from '@/lib/AdminAPI/specialDayService';
import { ApiResponse } from '@/service/apiClient';

/**
 * Server action để tạo special day mới
 */
export async function createSpecialDayAction(payload: CreateSpecialDayPayload) {
    try {
        const { createServerApiClient } = await import('@/lib/AdminAPI/serverApiClient');
        const serverClient = await createServerApiClient();
        
        const response = await serverClient.post<ApiResponse<SpecialDay>>('/special-days', payload);
        
        if (response.data.statusCode === 200 && response.data.data) {
            revalidatePath('/super-special-days');
            return { success: true, data: response.data.data };
        }
        
        return { success: false, error: response.data?.message || 'Không thể tạo ngày đặc biệt' };
    } catch (error: any) {
        console.error("[createSpecialDayAction] Error caught - Full error object:", error);
        
        // Xử lý các loại lỗi khác nhau
        let errorMessage = 'Lỗi khi tạo ngày đặc biệt';
        
        // Kiểm tra error.response trước
        if (error?.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            // Kiểm tra xem response có phải là HTML không (redirect đến login page)
            const isHtmlResponse = typeof data === 'string' && (
                data.trim().toLowerCase().startsWith('<!doctype') ||
                data.trim().toLowerCase().startsWith('<html') ||
                data.includes('accounts.google.com') ||
                data.includes('signin')
            );
            
            if (isHtmlResponse) {
                errorMessage = 'Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
            } else if (status === 409) {
                errorMessage = 'Ngày này đã tồn tại. Mỗi ngày chỉ có thể có một ngày đặc biệt.';
            } else if (status === 400) {
                errorMessage = data?.message || data?.error || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại ngày và tên.';
            } else if (status === 401) {
                errorMessage = 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            } else if (status === 403) {
                errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
            } else if (data?.message) {
                errorMessage = data.message;
            } else if (data?.error) {
                errorMessage = data.error;
            } else if (typeof data === 'string' && data.length < 500) {
                errorMessage = data;
            } else {
                errorMessage = `Lỗi từ server (${status}). Vui lòng thử lại.`;
            }
        } else if (error?.message) {
            // Kiểm tra xem message có phải là HTML không
            const isHtmlMessage = typeof error.message === 'string' && (
                error.message.trim().toLowerCase().startsWith('<!doctype') ||
                error.message.trim().toLowerCase().startsWith('<html') ||
                error.message.includes('accounts.google.com')
            );
            
            if (isHtmlMessage) {
                errorMessage = 'Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
            } else {
                errorMessage = error.message;
            }
        }
        
        console.error("[createSpecialDayAction] Final error message:", errorMessage);
        return { success: false, error: errorMessage };
    }
}

/**
 * Server action để cập nhật special day
 */
export async function updateSpecialDayAction(id: string, payload: UpdateSpecialDayPayload) {
    try {
        const { createServerApiClient } = await import('@/lib/AdminAPI/serverApiClient');
        const serverClient = await createServerApiClient();
        
        const response = await serverClient.put<ApiResponse<SpecialDay>>(`/special-days/${id}`, payload);
        
        if (response.data.statusCode === 200 && response.data.data) {
            revalidatePath('/super-special-days');
            return { success: true, data: response.data.data };
        }
        
        return { success: false, error: response.data?.message || 'Không thể cập nhật ngày đặc biệt' };
    } catch (error: any) {
        // Xử lý các loại lỗi khác nhau
        let errorMessage = 'Lỗi khi cập nhật ngày đặc biệt';
        
        if (error?.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 409) {
                errorMessage = 'Ngày này đã tồn tại. Mỗi ngày chỉ có thể có một ngày đặc biệt.';
            } else if (status === 400) {
                errorMessage = data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
            } else if (status === 404) {
                errorMessage = 'Không tìm thấy ngày đặc biệt cần cập nhật.';
            } else if (data?.message) {
                errorMessage = data.message;
            } else if (data?.error) {
                errorMessage = data.error;
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}

/**
 * Server action để xóa special day
 */
export async function deleteSpecialDayAction(id: string) {
    try {
        const { createServerApiClient } = await import('@/lib/AdminAPI/serverApiClient');
        const serverClient = await createServerApiClient();
        
        const response = await serverClient.delete<ApiResponse<SpecialDay>>(`/special-days/${id}`);
        
        if (response.data.statusCode === 200 && response.data.data) {
            revalidatePath('/super-special-days');
            return { success: true, data: response.data.data };
        }
        
        return { success: false, error: response.data?.message || 'Không thể xóa ngày đặc biệt' };
    } catch (error: any) {
        // Xử lý các loại lỗi khác nhau
        let errorMessage = 'Không thể xóa ngày đặc biệt';
        
        if (error?.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 400) {
                errorMessage = 'Không thể xóa ngày đặc biệt này vì nó đang được sử dụng trong mã giảm giá. Vui lòng xóa hoặc cập nhật các mã giảm giá liên quan trước.';
            } else if (status === 404) {
                errorMessage = 'Không tìm thấy ngày đặc biệt cần xóa.';
            } else if (data?.message) {
                errorMessage = data.message;
            } else if (data?.error) {
                errorMessage = data.error;
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}

