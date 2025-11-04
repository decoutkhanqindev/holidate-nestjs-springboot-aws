"use server";

import { revalidatePath } from 'next/cache';
import { createUserServer, updateUserServer, deleteUserServer, type CreateUserPayload, type UpdateUserPayload } from '@/lib/AdminAPI/userService';

/**
 * Server action để tạo user mới
 */
export async function createUserAction(formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const fullName = formData.get('fullName') as string;
        const phoneNumber = formData.get('phoneNumber') as string;
        const roleId = formData.get('roleId') as string;
        const authProvider = formData.get('authProvider') as string || 'LOCAL';

        // Validation
        if (!email || !password || !fullName || !roleId) {
            return { error: 'Email, mật khẩu, họ tên và quyền là bắt buộc.' };
        }

        if (password.length < 8) {
            return { error: 'Mật khẩu phải có ít nhất 8 ký tự.' };
        }

        console.log('[createUserAction] Creating user:', { email, fullName, roleId });

        const payload: CreateUserPayload = {
            email: email.trim(),
            password: password.trim(),
            fullName: fullName.trim(),
            phoneNumber: phoneNumber?.trim() || undefined,
            roleId: roleId.trim(),
            authProvider: authProvider.trim(),
        };

        await createUserServer(payload);

        revalidatePath('/admin-users');
        return { success: true };
    } catch (error: any) {
        console.error('[createUserAction] Error:', error);
        return { error: error.message || 'Không thể tạo người dùng. Vui lòng thử lại.' };
    }
}

/**
 * Server action để cập nhật user
 */
export async function updateUserAction(userId: string, formData: FormData) {
    try {
        const fullName = formData.get('fullName') as string;
        const phoneNumber = formData.get('phoneNumber') as string;
        const password = formData.get('password') as string; // Optional - chỉ cập nhật nếu có

        // Validation
        if (!fullName) {
            return { error: 'Họ tên là bắt buộc.' };
        }

        // Nếu có mật khẩu mới, cần validate
        if (password && password.length > 0 && password.length < 8) {
            return { error: 'Mật khẩu phải có ít nhất 8 ký tự.' };
        }

        console.log(`[updateUserAction] Updating user ${userId}...`);

        const payload: UpdateUserPayload = {
            fullName: fullName.trim(),
            phoneNumber: phoneNumber?.trim() || undefined,
            // Note: Backend API không hỗ trợ cập nhật password qua PUT /users/{id}
            // Cần endpoint riêng để đổi mật khẩu
        };

        await updateUserServer(userId, payload);

        revalidatePath('/admin-users');
        return { success: true };
    } catch (error: any) {
        console.error('[updateUserAction] Error:', error);
        return { error: error.message || 'Không thể cập nhật người dùng. Vui lòng thử lại.' };
    }
}

/**
 * Server action để xóa user
 */
export async function deleteUserAction(userId: string) {
    try {
        console.log(`[deleteUserAction] Deleting user ${userId}...`);

        await deleteUserServer(userId);

        revalidatePath('/admin-users');
        return { success: true };
    } catch (error: any) {
        console.error('[deleteUserAction] Error:', error);
        const errorMessage = error.message || 'Không thể xóa người dùng. Vui lòng thử lại.';
        throw new Error(errorMessage);
    }
}

