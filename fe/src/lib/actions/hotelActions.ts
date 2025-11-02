"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHotel, updateHotel, deleteHotel as deleteHotelService } from "@/lib/AdminAPI/hotelService";
import type { HotelStatus } from "@/types";

// ACTION ĐỂ TẠO KHÁCH SẠN MỚI
export async function createHotelAction(formData: FormData) {
    // 1. Lấy và xử lý ảnh TRƯỚC TIÊN
    const imageFile = formData.get('image') as File;
    let imageUrl = ''; // Khởi tạo imageUrl mặc định

    if (imageFile && imageFile.size > 0) {
        // **LOGIC UPLOAD ẢNH THẬT SẼ Ở ĐÂY**
        // Ví dụ: imageUrl = await uploadToCloudinary(imageFile);
        console.log("Đã nhận được file ảnh:", imageFile.name);
        imageUrl = `/placeholder-uploaded-${Date.now()}.png`; // Giả lập URL duy nhất sau khi upload
    }

    // 2. Tạo đối tượng data hoàn chỉnh, BAO GỒM CẢ imageUrl
    const dataToCreate = {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        status: 'PENDING' as HotelStatus,
        stt: Number(formData.get('stt')),
        description: formData.get('description') as string,
        imageUrl: imageUrl, // << GỘP imageUrl VÀO ĐÂY
    };

    // 3. Validation
    if (!dataToCreate.name || !dataToCreate.address) {
        return { error: "Tên và địa chỉ là bắt buộc." };
    }

    // 4. Gọi service với đối tượng data đã hoàn chỉnh
    await createHotel(dataToCreate);

    revalidatePath("/admin-hotels");
    redirect("/admin-hotels");
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