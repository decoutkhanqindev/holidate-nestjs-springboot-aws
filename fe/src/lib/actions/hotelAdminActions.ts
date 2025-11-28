"use server";

import { revalidatePath } from 'next/cache';
import { createHotelAdminServer, deleteHotelAdminServer } from '@/lib/Super_Admin/hotelAdminService';
import { getRoles } from '@/lib/AdminAPI/userService';

/**
 * Server action để tạo Hotel Admin mới
 */
export async function createHotelAdminAction(formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const fullName = formData.get('fullName') as string;
        const phoneNumber = formData.get('phoneNumber') as string;
        const hotelId = formData.get('hotelId') as string;
        const authProvider = formData.get('authProvider') as string || 'LOCAL';

        // Validation - hotelId không bắt buộc vì đã ẩn field chọn khách sạn
        if (!email || !password || !fullName) {
            return { error: 'Email, mật khẩu và họ tên là bắt buộc.' };
        }

        if (password.length < 8) {
            return { error: 'Mật khẩu phải có ít nhất 8 ký tự.' };
        }

        // Validation fullName: 3-100 ký tự
        if (fullName.trim().length < 3 || fullName.trim().length > 100) {
            return { error: 'Họ và tên phải có từ 3 đến 100 ký tự.' };
        }

        // Validation phoneNumber nếu có: phải bắt đầu bằng +84 hoặc 0, sau đó 9-10 chữ số
        if (phoneNumber && phoneNumber.trim()) {
            const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
            if (!phoneRegex.test(phoneNumber.trim())) {
                return { error: 'Số điện thoại không hợp lệ. Phải bắt đầu bằng +84 hoặc 0, sau đó 9-10 chữ số (VD: 0123456789, +84123456789).' };
            }
        }

        console.log('[createHotelAdminAction] Creating hotel admin:', { email, fullName, hotelId: hotelId || 'N/A' });

        const payload = {
            email: email.trim(),
            password: password.trim(),
            fullName: fullName.trim(),
            phoneNumber: phoneNumber?.trim() || undefined,
            hotelId: hotelId?.trim() || '', // Optional - có thể để trống nếu không chọn hotel
            authProvider: authProvider.trim(),
        };

        const newUser =         await createHotelAdminServer(payload);

        revalidatePath('/super-user-management');
        return { success: true };
    } catch (error: any) {
        console.error('[createHotelAdminAction] Error:', error);
        return { error: error.message || 'Không thể tạo admin khách sạn. Vui lòng thử lại.' };
    }
}

/**
 * Server action để xóa Hotel Admin
 */
export async function deleteHotelAdminAction(userId: string) {
    try {
        console.log(`[deleteHotelAdminAction] Deleting hotel admin ${userId}...`);

        await deleteHotelAdminServer(userId);

        revalidatePath('/super-user-management');
        return { success: true };
    } catch (error: any) {
        console.error('[deleteHotelAdminAction] Error:', error);
        const errorMessage = error.message || 'Không thể xóa admin khách sạn. Vui lòng thử lại.';
        throw new Error(errorMessage);
    }
}

