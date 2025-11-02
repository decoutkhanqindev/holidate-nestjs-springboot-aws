"use server";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { createRoom } from '@/lib/AdminAPI/roomService';

export async function createRoomAction(formData: FormData) {
    const data = {
        hotelId: formData.get('hotelId') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: Number(formData.get('price')),
        bedType: formData.get('bedType') as string,
        capacity: Number(formData.get('capacity')),
        view: formData.get('view') as string,
        // Lấy danh sách các checkbox đã chọn
        amenities: formData.getAll('amenities') as string[],
    };

    console.log("Dữ liệu phòng mới:", data);

    // await createRoom(data);

    revalidatePath("/admin-rooms");
    redirect("/admin-rooms");
}