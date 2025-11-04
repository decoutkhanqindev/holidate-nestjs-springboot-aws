"use server";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createRoomServer, type CreateRoomPayload } from '@/lib/AdminAPI/roomService';

export async function createRoomAction(formData: FormData) {
    // Log ở client-side để thấy trong browser console
    console.log("=".repeat(80));
    console.log("[createRoomAction] ===== CLIENT-SIDE: Starting room creation =====");
    console.log("[createRoomAction] FormData entries (client-side):");

    const clientFormDataEntries: Array<{ key: string; value: string }> = [];
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            clientFormDataEntries.push({
                key,
                value: `File: ${value.name} (${value.size} bytes)`
            });
        } else {
            clientFormDataEntries.push({
                key,
                value: String(value)
            });
        }
    }
    clientFormDataEntries.forEach((entry, index) => {
        console.log(`  [${index + 1}] ${entry.key} = ${entry.value}`);
    });
    console.log("=".repeat(80));

    try {
        const hotelId = formData.get('hotelId') as string;
        const name = formData.get('name') as string;
        const view = formData.get('view') as string;
        const area = formData.get('area') as string;
        const maxAdults = formData.get('maxAdults') as string;
        const maxChildren = formData.get('maxChildren') as string;
        const basePricePerNight = formData.get('basePricePerNight') as string;
        const bedTypeName = formData.get('bedTypeName') as string; // Đổi từ bedTypeId sang bedTypeName
        const quantity = formData.get('quantity') as string;

        // Handle boolean checkboxes - FormData.get() trả về 'true' string nếu checked, null nếu unchecked
        const smokingAllowed = formData.get('smokingAllowed') === 'true';
        const wifiAvailable = formData.get('wifiAvailable') === 'true';
        const breakfastIncluded = formData.get('breakfastIncluded') === 'true';

        // Lấy photos
        const photos = formData.getAll('photos') as File[];
        const validPhotos = photos.filter((photo) => photo instanceof File && photo.size > 0);

        // Lấy amenityIds
        const amenityIds = formData.getAll('amenityIds') as string[];
        const validAmenityIds = amenityIds.filter(id => id && id.trim() !== '');

        // Validation
        if (!hotelId || !name || !view || !area || !maxAdults || !maxChildren || !basePricePerNight || !bedTypeName || !quantity) {
            return { error: "Vui lòng điền đầy đủ các trường bắt buộc." };
        }

        if (validPhotos.length === 0) {
            return { error: "Vui lòng tải lên ít nhất 1 ảnh." };
        }

        if (validAmenityIds.length === 0) {
            return { error: "Vui lòng chọn ít nhất 1 tiện ích." };
        }

        // Tìm bedType ID từ tên (tìm trong tất cả hotels)
        console.log('[createRoomAction] Finding bedType ID for name:', bedTypeName);
        const { findOrCreateBedTypeByName } = await import('@/lib/AdminAPI/bedTypeService');
        let bedTypeId: string;

        try {
            bedTypeId = await findOrCreateBedTypeByName(bedTypeName.trim(), hotelId.trim());
        } catch (bedTypeError: any) {
            console.error('[createRoomAction] Error finding bedType:', bedTypeError);
            return { error: bedTypeError.message || `Không tìm thấy loại giường "${bedTypeName}". Vui lòng sử dụng loại giường có sẵn.` };
        }

        console.log('[createRoomAction] Creating room with data:', {
            hotelId,
            name,
            view,
            area: parseFloat(area),
            maxAdults: parseInt(maxAdults),
            maxChildren: parseInt(maxChildren),
            basePricePerNight: parseFloat(basePricePerNight),
            bedTypeName,
            bedTypeId,
            quantity: parseInt(quantity),
            photosCount: validPhotos.length,
            amenityIdsCount: validAmenityIds.length,
        });

        // Xây dựng payload
        const payload: CreateRoomPayload = {
            hotelId: hotelId.trim(),
            name: name.trim(),
            view: view.trim(),
            area: parseFloat(area),
            photos: validPhotos,
            maxAdults: parseInt(maxAdults),
            maxChildren: parseInt(maxChildren),
            basePricePerNight: parseFloat(basePricePerNight),
            bedTypeId: bedTypeId, // Sử dụng bedTypeId đã tìm được
            smokingAllowed,
            wifiAvailable,
            breakfastIncluded,
            quantity: parseInt(quantity),
            amenityIds: validAmenityIds.map(id => id.trim()),
        };

        // Log payload trước khi gọi server
        console.log("[createRoomAction] ===== CLIENT-SIDE: Payload before calling server =====");
        console.log("[createRoomAction] Payload:", {
            hotelId,
            name,
            view,
            area: parseFloat(area),
            maxAdults: parseInt(maxAdults),
            maxChildren: parseInt(maxChildren),
            basePricePerNight: parseFloat(basePricePerNight),
            bedTypeId,
            quantity: parseInt(quantity),
            photosCount: validPhotos.length,
            amenityIdsCount: validAmenityIds.length,
        });
        console.log("=".repeat(80));
        console.log("[createRoomAction] NOTE: Server-side logs will appear in TERMINAL, not browser console!");
        console.log("=".repeat(80));

        // Gọi API (server-side)
        await createRoomServer(payload);

        console.log("[createRoomAction] ===== CLIENT-SIDE: Room created successfully =====");
        revalidatePath("/admin-rooms");
        redirect("/admin-rooms");
    } catch (error: any) {
        console.error("=".repeat(80));
        console.error("[createRoomAction] ===== CLIENT-SIDE ERROR =====");
        console.error("[createRoomAction] Error:", error);
        console.error("[createRoomAction] Error message:", error.message);
        console.error("[createRoomAction] NOTE: Detailed server-side logs are in TERMINAL!");
        console.error("=".repeat(80));
        return { error: error.message || "Không thể tạo phòng. Vui lòng thử lại." };
    }
}

export async function updateRoomAction(roomId: string, formData: FormData) {
    try {
        // Tương tự createRoomAction nhưng dùng updateRoom
        // TODO: Implement update logic
        console.log(`[updateRoomAction] Updating room ${roomId}`);

        revalidatePath(`/admin-rooms`);
        revalidatePath(`/admin-rooms/${roomId}`);
        redirect("/admin-rooms");
    } catch (error: any) {
        console.error("[updateRoomAction] Error:", error);
        return { error: error.message || "Không thể cập nhật phòng. Vui lòng thử lại." };
    }
}

export async function deleteRoomAction(roomId: string) {
    try {
        const { deleteRoom } = await import('@/lib/AdminAPI/roomService');
        await deleteRoom(roomId);

        revalidatePath("/admin-rooms");
        // Không redirect, để component tự refresh
    } catch (error: any) {
        console.error("[deleteRoomAction] Error:", error);
        throw new Error(error.message || "Không thể xóa phòng. Vui lòng thử lại.");
    }
}
