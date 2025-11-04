"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHotelServer, updateHotel, deleteHotel as deleteHotelService } from "@/lib/AdminAPI/hotelService";
import type { HotelStatus } from "@/types";

// ACTION ĐỂ TẠO KHÁCH SẠN MỚI
export async function createHotelAction(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const address = formData.get('address') as string;
        const description = formData.get('description') as string;

        // Lấy các field location - PHẢI CÓ ID từ dropdown
        const countryId = formData.get('countryId') as string;
        const provinceId = formData.get('provinceId') as string;
        const cityId = formData.get('cityId') as string;
        const districtId = formData.get('districtId') as string;
        const wardId = formData.get('wardId') as string;
        const streetId = formData.get('streetId') as string;
        const partnerId = formData.get('partnerId') as string;

        // Validation
        if (!name || !address) {
            return { error: "Tên và địa chỉ là bắt buộc." };
        }

        // Validate required fields cho API - TẤT CẢ PHẢI CÓ ID
        if (!countryId || !provinceId || !cityId || !districtId || !wardId || !streetId || !partnerId) {
            return { error: "Vui lòng điền đầy đủ thông tin địa chỉ (chọn từ danh sách) và đối tác." };
        }

        console.log('[createHotelAction] Creating hotel with location IDs:', {
            countryId, provinceId, cityId, districtId, wardId, streetId, partnerId
        });

        // Xây dựng JSON payload để gửi lên API (CREATE dùng JSON)
        // Note: description là required trong API docs, không được để rỗng
        const payload = {
            name: name.trim(),
            description: (description && description.trim()) || 'Không có mô tả', // Đảm bảo description không rỗng
            address: address.trim(),
            countryId: countryId.trim(),
            provinceId: provinceId.trim(),
            cityId: cityId.trim(),
            districtId: districtId.trim(),
            wardId: wardId.trim(),
            streetId: streetId.trim(),
            partnerId: partnerId.trim(),
        };

        console.log('[createHotelAction] Final payload before sending:', JSON.stringify(payload, null, 2));

        // Dùng createHotelServer (dành cho server actions - lấy token từ cookies)
        await createHotelServer(payload);

        // TODO: Nếu cần upload ảnh riêng sau khi tạo hotel, thực hiện ở đây

        revalidatePath("/admin-hotels");
        redirect("/admin-hotels");
    } catch (error: any) {
        console.error("[createHotelAction] Error:", error);
        return { error: error.message || "Không thể tạo khách sạn. Vui lòng thử lại." };
    }
}

// ACTION ĐỂ CẬP NHẬT KHÁCH SẠN
// (Cần bổ sung logic upload ảnh tương tự nếu bạn muốn cho phép sửa ảnh)
export async function updateHotelAction(id: string, formData: FormData) {
    const data = {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        status: formData.get('status') as HotelStatus,
        // Bổ sung các trường khác nếu cho phép sửa
        stt: Number(formData.get('stt')),
        description: formData.get('description') as string,
    };

    // Logic xử lý upload ảnh mới khi sửa (nếu có)
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
        // ... upload ảnh mới và lấy newImageUrl ...
        // (data as any).imageUrl = newImageUrl;
    }


    if (!data.name || !data.address) {
        return { error: "Tên và địa chỉ là bắt buộc." };
    }

    await updateHotel(id, data);

    revalidatePath("/admin-hotels");
    revalidatePath(`/admin-hotels/${id}`);
    redirect("/admin-hotels");
}

// ACTION ĐỂ XÓA KHÁCH SẠN
export async function deleteHotelAction(id: string) {
    try {
        await deleteHotelService(id);
        revalidatePath("/admin-hotels");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Xóa khách sạn thất bại." };
    }
}