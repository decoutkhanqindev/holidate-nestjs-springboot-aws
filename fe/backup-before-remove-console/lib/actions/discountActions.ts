"use server";

import { revalidatePath } from 'next/cache';
import { createDiscountServer, updateDiscountServer, deleteDiscountServer } from '@/lib/Super_Admin/discountService';

/**
 * Server action để tạo mã giảm giá mới
 */
export async function createDiscountAction(formData: FormData) {
    try {
        const code = formData.get('code') as string;
        const description = formData.get('description') as string;
        const percentage = formData.get('percentage') as string;
        const usageLimit = formData.get('usageLimit') as string;
        const timesUsed = formData.get('timesUsed') as string;
        const minBookingPrice = formData.get('minBookingPrice') as string;
        const minBookingCount = formData.get('minBookingCount') as string;
        const validFrom = formData.get('validFrom') as string;
        const validTo = formData.get('validTo') as string;
        const hotelId = formData.get('hotelId') as string;
        const specialDayId = formData.get('specialDayId') as string;

        // Validation
        if (!code || !description || !percentage || !usageLimit || !minBookingPrice || !minBookingCount || !validFrom || !validTo) {
            return { error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' };
        }

        // Validate ngày bắt đầu không được chọn ngày quá khứ (phải từ hôm nay trở đi)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fromDate = new Date(validFrom);
        fromDate.setHours(0, 0, 0, 0);
        
        if (fromDate < today) {
            return { error: 'Ngày bắt đầu không được chọn ngày quá khứ. Chỉ được chọn từ hôm nay trở đi.' };
        }

        const percentageNum = parseFloat(percentage);
        if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
            return { error: 'Phần trăm giảm giá phải từ 0 đến 100.' };
        }

        const usageLimitNum = parseInt(usageLimit);
        if (isNaN(usageLimitNum) || usageLimitNum <= 0) {
            return { error: 'Giới hạn sử dụng phải là số dương.' };
        }

        const minBookingPriceNum = parseInt(minBookingPrice);
        if (isNaN(minBookingPriceNum) || minBookingPriceNum < 0) {
            return { error: 'Giá đặt phòng tối thiểu phải là số không âm.' };
        }

        const minBookingCountNum = parseInt(minBookingCount);
        if (isNaN(minBookingCountNum) || minBookingCountNum <= 0) {
            return { error: 'Số lượng đặt phòng tối thiểu phải là số dương.' };
        }

        const timesUsedNum = timesUsed ? parseInt(timesUsed) : 0;
        if (isNaN(timesUsedNum) || timesUsedNum < 0) {
            return { error: 'Số lần đã sử dụng phải là số không âm.' };
        }

        console.log('[createDiscountAction] Creating discount:', { code, description });

        const payload = {
            code: code.trim(),
            description: description.trim(),
            percentage: percentageNum,
            usageLimit: usageLimitNum,
            timesUsed: timesUsedNum,
            minBookingPrice: minBookingPriceNum,
            minBookingCount: minBookingCountNum,
            validFrom: validFrom.trim(),
            validTo: validTo.trim(),
            hotelId: hotelId?.trim() || undefined,
            specialDayId: specialDayId?.trim() || undefined,
        };

        await createDiscountServer(payload);

        revalidatePath('/super-discounts');
        return { success: true };
    } catch (error: any) {
        console.error('[createDiscountAction] Error:', error);
        return { error: error.message || 'Không thể tạo mã giảm giá. Vui lòng thử lại.' };
    }
}

/**
 * Server action để cập nhật mã giảm giá
 */
export async function updateDiscountAction(formData: FormData) {
    try {
        const id = formData.get('id') as string;
        if (!id) {
            return { error: 'Không tìm thấy ID mã giảm giá.' };
        }

        // Lấy discount hiện tại từ server để merge với các thay đổi
        let currentDiscount: any = null;
        try {
            const { createServerApiClient } = await import('@/lib/AdminAPI/serverApiClient');
            const serverClient = await createServerApiClient();
            const { ApiResponse } = await import('@/service/apiClient');
            
            const response = await serverClient.get<typeof ApiResponse<any>>(`/discounts/${id}`);
            if (response.data?.statusCode === 200 && response.data?.data) {
                currentDiscount = response.data.data;
                console.log(`[updateDiscountAction] Current discount loaded successfully`);
            }
        } catch (error) {
            console.error(`[updateDiscountAction] Error fetching current discount:`, error);
            // Tiếp tục với update nếu không lấy được
        }

        const code = formData.get('code') as string;
        const description = formData.get('description') as string;
        const percentage = formData.get('percentage') as string;
        const usageLimit = formData.get('usageLimit') as string;
        const timesUsed = formData.get('timesUsed') as string;
        const minBookingPrice = formData.get('minBookingPrice') as string;
        const minBookingCount = formData.get('minBookingCount') as string;
        const validFrom = formData.get('validFrom') as string;
        const validTo = formData.get('validTo') as string;
        const active = formData.get('active') as string;
        const activeValue = formData.get('activeValue') as string;
        const hotelId = formData.get('hotelId') as string;
        const specialDayId = formData.get('specialDayId') as string;

        const payload: any = {};

        // Strategy: Gửi tất cả các field từ discount hiện tại, chỉ override những field được thay đổi
        // Điều này đảm bảo backend nhận được đầy đủ thông tin
        
        // Bắt đầu với giá trị hiện tại (nếu có)
        if (currentDiscount) {
            // Chuyển đổi Date sang string format YYYY-MM-DD
            payload.code = currentDiscount.code;
            payload.description = currentDiscount.description;
            payload.percentage = currentDiscount.percentage;
            payload.usageLimit = currentDiscount.usageLimit;
            payload.timesUsed = currentDiscount.timesUsed;
            payload.minBookingPrice = currentDiscount.minBookingPrice;
            payload.minBookingCount = currentDiscount.minBookingCount;
            payload.validFrom = currentDiscount.validFrom instanceof Date 
                ? currentDiscount.validFrom.toISOString().split('T')[0]
                : typeof currentDiscount.validFrom === 'string' 
                    ? currentDiscount.validFrom.split('T')[0]
                    : currentDiscount.validFrom;
            payload.validTo = currentDiscount.validTo instanceof Date
                ? currentDiscount.validTo.toISOString().split('T')[0]
                : typeof currentDiscount.validTo === 'string'
                    ? currentDiscount.validTo.split('T')[0]
                    : currentDiscount.validTo;
            payload.active = currentDiscount.active;
        }
        
        // Override với các giá trị từ form (nếu có)
        if (code && code.trim() !== '') {
            payload.code = code.trim();
        }
        
        if (description && description.trim() !== '') {
            payload.description = description.trim();
        }
        
        // Parse và validate số - chỉ gửi nếu có giá trị hợp lệ
        if (percentage && percentage.trim() !== '') {
            const percentageNum = parseFloat(percentage);
            if (!isNaN(percentageNum)) {
                if (percentageNum < 0 || percentageNum > 100) {
                    return { error: 'Phần trăm giảm giá phải từ 0 đến 100.' };
                }
                payload.percentage = percentageNum; // Backend expect Double
            }
        }
        
        if (usageLimit && usageLimit.trim() !== '') {
            const usageLimitNum = parseInt(usageLimit, 10);
            if (!isNaN(usageLimitNum)) {
                if (usageLimitNum <= 0) {
                    return { error: 'Giới hạn sử dụng phải là số dương (lớn hơn 0).' };
                }
                payload.usageLimit = usageLimitNum; // Backend expect Integer
            }
        }
        
        if (timesUsed && timesUsed.trim() !== '') {
            const timesUsedNum = parseInt(timesUsed, 10);
            if (!isNaN(timesUsedNum)) {
                if (timesUsedNum < 0) {
                    return { error: 'Số lần đã sử dụng không thể là số âm.' };
                }
                payload.timesUsed = timesUsedNum; // Backend expect Integer
            }
        }
        // Không set timesUsed = 0 nếu không có giá trị - để backend giữ nguyên
        
        if (minBookingPrice && minBookingPrice.trim() !== '') {
            const minBookingPriceNum = parseInt(minBookingPrice, 10);
            if (!isNaN(minBookingPriceNum)) {
                if (minBookingPriceNum < 0) {
                    return { error: 'Giá đặt phòng tối thiểu không thể là số âm.' };
                }
                payload.minBookingPrice = minBookingPriceNum; // Backend expect Integer
            }
        }
        
        if (minBookingCount && minBookingCount.trim() !== '') {
            const minBookingCountNum = parseInt(minBookingCount, 10);
            if (!isNaN(minBookingCountNum)) {
                if (minBookingCountNum <= 0) {
                    return { error: 'Số lượng đặt phòng tối thiểu phải là số dương (lớn hơn 0).' };
                }
                payload.minBookingCount = minBookingCountNum; // Backend expect Integer
            }
        }
        
        // Dates - đảm bảo format YYYY-MM-DD (ISO date format)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time để so sánh chỉ ngày
        
        if (!isEditing && validFrom && validFrom.trim() !== '') {
            // Chỉ validate và set validFrom khi tạo mới
            const fromDate = new Date(validFrom);
            fromDate.setHours(0, 0, 0, 0);
            
            if (isNaN(fromDate.getTime())) {
                return { error: 'Ngày bắt đầu không hợp lệ.' };
            }
            
            // Ngày bắt đầu không được chọn ngày quá khứ (phải từ hôm nay trở đi)
            if (fromDate < today) {
                return { error: 'Ngày bắt đầu không được chọn ngày quá khứ. Chỉ được chọn từ hôm nay trở đi.' };
            }
            
            payload.validFrom = validFrom.trim();
        }
        // Khi edit: không gửi validFrom - giữ nguyên từ currentDiscount (đã được load trước đó)
        
        if (validTo && validTo.trim() !== '') {
            // Validate date format
            const toDate = new Date(validTo);
            toDate.setHours(0, 0, 0, 0);
            
            if (isNaN(toDate.getTime())) {
                return { error: 'Ngày kết thúc không hợp lệ.' };
            }
            
            payload.validTo = validTo.trim();
            
            // Validate: ngày kết thúc phải sau ngày bắt đầu
            // Lấy ngày bắt đầu từ currentDiscount (khi edit) hoặc từ payload (khi tạo mới)
            const fromDateToCheck = currentDiscount?.validFrom 
                ? new Date(currentDiscount.validFrom) 
                : (payload.validFrom ? new Date(payload.validFrom) : null);
            
            if (fromDateToCheck) {
                fromDateToCheck.setHours(0, 0, 0, 0);
                if (toDate < fromDateToCheck) {
                    return { error: 'Ngày kết thúc phải sau ngày bắt đầu.' };
                }
            }
        }
        
        // Xử lý active: ưu tiên activeValue từ hidden input
        // Backend expect Boolean (true/false), không phải string
        if (activeValue !== null && activeValue !== undefined && activeValue.trim() !== '') {
            payload.active = activeValue === 'true';
        } else if (active !== null && active !== undefined && active !== '') {
            // Checkbox có thể là 'true', 'false', 'on', hoặc empty string
            payload.active = active === 'true' || active === 'on';
        }
        // Nếu không có active từ form và không có currentDiscount, mặc định là true
        if (payload.active === undefined && !currentDiscount) {
            payload.active = true;
        }
        
        // hotelId và specialDayId: chỉ gửi nếu có giá trị thực sự
        // KHÔNG gửi nếu empty string hoặc chỉ có khoảng trắng
        // Backend có thể gặp lỗi khi nhận empty string cho các field này
        if (hotelId && hotelId.trim() !== '' && hotelId.trim().length > 0) {
            const trimmedHotelId = hotelId.trim();
            // Validate UUID format cơ bản (ít nhất phải có độ dài hợp lý)
            if (trimmedHotelId.length >= 10) {
                payload.hotelId = trimmedHotelId;
            }
        }
        if (specialDayId && specialDayId.trim() !== '' && specialDayId.trim().length > 0) {
            const trimmedSpecialDayId = specialDayId.trim();
            // Validate UUID format cơ bản
            if (trimmedSpecialDayId.length >= 10) {
                payload.specialDayId = trimmedSpecialDayId;
            }
        }
        
        // Kiểm tra payload có rỗng không
        if (Object.keys(payload).length === 0) {
            return { error: 'Không có thông tin nào để cập nhật. Vui lòng thay đổi ít nhất một trường.' };
        }
        
        // Log để debug
        console.log(`[updateDiscountAction] Final payload:`, JSON.stringify(payload, null, 2));
        console.log(`[updateDiscountAction] Payload fields count:`, Object.keys(payload).length);
        console.log(`[updateDiscountAction] Payload fields:`, Object.keys(payload));

        console.log(`[updateDiscountAction] Updating discount ${id}:`, payload);

        await updateDiscountServer(id, payload);

        revalidatePath('/super-discounts');
        return { success: true };
    } catch (error: any) {
        console.error('[updateDiscountAction] Error:', error);
        return { error: error.message || 'Không thể cập nhật mã giảm giá. Vui lòng thử lại.' };
    }
}

/**
 * Server action để xóa mã giảm giá
 */
export async function deleteDiscountAction(id: string) {
    try {
        console.log(`[deleteDiscountAction] Deleting discount ${id}...`);

        await deleteDiscountServer(id);

        revalidatePath('/super-discounts');
        return { success: true };
    } catch (error: any) {
        console.error('[deleteDiscountAction] Error:', error);
        const errorMessage = error.message || 'Không thể xóa mã giảm giá. Vui lòng thử lại.';
        throw new Error(errorMessage);
    }
}

