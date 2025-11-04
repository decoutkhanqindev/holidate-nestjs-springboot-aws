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

        // Validation
        if (!email || !password || !fullName || !hotelId) {
            return { error: 'Email, mật khẩu, họ tên và khách sạn là bắt buộc.' };
        }

        if (password.length < 8) {
            return { error: 'Mật khẩu phải có ít nhất 8 ký tự.' };
        }

        console.log('[createHotelAdminAction] Creating hotel admin:', { email, fullName, hotelId });

        const payload = {
            email: email.trim(),
            password: password.trim(),
            fullName: fullName.trim(),
            phoneNumber: phoneNumber?.trim() || undefined,
            hotelId: hotelId.trim(),
            authProvider: authProvider.trim(),
        };

        await createHotelAdminServer(payload);

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

