"use server";

import { revalidatePath } from 'next/cache';
import { createHotelAdminServer, deleteHotelAdminServer } from '@/lib/Super_Admin/hotelAdminService';
import { getRoles, updateUserServer } from '@/lib/AdminAPI/userService';

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


        const payload = {
            email: email.trim(),
            password: password.trim(),
            fullName: fullName.trim(),
            phoneNumber: phoneNumber?.trim() || undefined,
            hotelId: hotelId?.trim() || '', // Optional - có thể để trống nếu không chọn hotel
            authProvider: authProvider.trim(),
        };

        const newUser = await createHotelAdminServer(payload);

        revalidatePath('/super-user-management');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || 'Không thể tạo admin khách sạn. Vui lòng thử lại.' };
    }
}

/**
 * Server action để cập nhật Hotel Admin
 */
export async function updateHotelAdminAction(formData: FormData) {
    try {
        const userId = formData.get('userId') as string;
        const fullName = formData.get('fullName') as string | null;
        const active = formData.get('active') as string | null;

        if (!userId) {
            return { error: 'Thiếu thông tin user ID.' };
        }

        // Validation fullName - required field
        if (!fullName || !fullName.trim()) {
            return { error: 'Họ và tên là bắt buộc.' };
        }
        if (fullName.trim().length < 3 || fullName.trim().length > 100) {
            return { error: 'Họ và tên phải có từ 3 đến 100 ký tự.' };
        }

        const payload: any = {};
        // Luôn gửi fullName vì là required field
        payload.fullName = fullName.trim();

        // Luôn gửi active khi edit (vì form luôn có field active khi edit)
        // Convert string "true"/"false" từ form thành boolean
        if (active !== null && active !== undefined && active !== '') {
            payload.active = active === 'true' || active === '1';
        } else {
            // Nếu không có giá trị từ form (trường hợp hiếm), mặc định là true
            payload.active = true;
        }

        // Log để debug
        console.log('[updateHotelAdminAction] Sending payload:', {
            userId,
            fullName: payload.fullName,
            active: payload.active,
            activeType: typeof payload.active,
            activeFromForm: active
        });

        const updatedUser = await updateUserServer(userId, payload);

        // Log response để kiểm tra
        // QUAN TRỌNG: active nằm trong authInfo.active, không phải ở root level
        const activeValue = updatedUser.authInfo?.active !== undefined
            ? updatedUser.authInfo.active
            : (updatedUser.active !== undefined ? updatedUser.active : undefined);

        console.log('[updateHotelAdminAction] Response from updateUserServer:', {
            userId: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            activeFromAuthInfo: updatedUser.authInfo?.active,
            activeFromRoot: updatedUser.active,
            finalActive: activeValue,
            activeType: typeof activeValue,
            hasAuthInfo: !!updatedUser.authInfo
        });

        revalidatePath('/super-user-management');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || 'Không thể cập nhật admin khách sạn. Vui lòng thử lại.' };
    }
}

/**
 * Server action để xóa Hotel Admin
 */
export async function deleteHotelAdminAction(userId: string) {
    try {

        await deleteHotelAdminServer(userId);

        revalidatePath('/super-user-management');
        return { success: true };
    } catch (error: any) {
        const errorMessage = error.message || 'Không thể xóa admin khách sạn. Vui lòng thử lại.';
        throw new Error(errorMessage);
    }
}

