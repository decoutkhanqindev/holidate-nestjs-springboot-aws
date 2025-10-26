// src/lib/actions/hotelActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHotel, updateHotel, deleteHotel as deleteHotelService } from "@/lib/AdminAPI/hotelService";
import type { HotelStatus } from "@/types";

// Action để tạo khách sạn mới
export async function createHotelAction(formData: FormData) {
    const data = {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        status: formData.get('status') as HotelStatus,
    };

    // Validation cơ bản (có thể dùng Zod để nâng cao)
    if (!data.name || !data.address) {
        return { error: "Tên và địa chỉ là bắt buộc." };
    }

    await createHotel(data);

    revalidatePath("/hotels");
    redirect("/hotels");
}

// Action để cập nhật khách sạn
export async function updateHotelAction(id: string, formData: FormData) {
    const data = {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        status: formData.get('status') as HotelStatus,
    };

    if (!data.name || !data.address) {
        return { error: "Tên và địa chỉ là bắt buộc." };
    }

    await updateHotel(id, data);

    revalidatePath("/hotels");
    revalidatePath(`/hotels/${id}`);
    redirect("/hotels");
}

// Action để xóa khách sạn
export async function deleteHotelAction(id: string) {
    try {
        await deleteHotelService(id);
        revalidatePath("/hotels");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Xóa khách sạn thất bại." };
    }
}