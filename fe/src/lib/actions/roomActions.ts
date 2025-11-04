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

        // Map status từ frontend (uppercase) sang backend (lowercase)
        const statusMap: Record<string, string> = {
            'AVAILABLE': 'active',
            'OCCUPIED': 'active', // OCCUPIED không có trong backend pattern, dùng active
            'MAINTENANCE': 'maintenance',
            'INACTIVE': 'inactive',
            'CLOSED': 'closed'
        };
        const backendStatus = status ? (statusMap[status.toUpperCase()] || status.toLowerCase()) : 'active';

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
            status: backendStatus, // Thêm status
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

        // redirect() throws a special error that Next.js catches - don't catch it
        redirect("/admin-rooms");
    } catch (error: any) {
        // Next.js redirect() throws a special error - don't treat it as an error
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            // Re-throw redirect errors so Next.js can handle them
            throw error;
        }

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
    console.log("=".repeat(80));
    console.log("[updateRoomAction] ===== CLIENT-SIDE: Starting room update =====");
    console.log("[updateRoomAction] Room ID:", roomId);
    console.log("[updateRoomAction] FormData entries (client-side):");

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
        const bedTypeName = formData.get('bedTypeName') as string;
        const quantity = formData.get('quantity') as string;
        const status = formData.get('status') as string; // Lấy status từ form

        // Handle boolean checkboxes
        const smokingAllowed = formData.get('smokingAllowed') === 'true';
        const wifiAvailable = formData.get('wifiAvailable') === 'true';
        const breakfastIncluded = formData.get('breakfastIncluded') === 'true';

        // Lấy photos
        const photos = formData.getAll('photos') as File[];
        const validPhotos = photos.filter((photo) => photo instanceof File && photo.size > 0);

        // Lấy amenityIds
        const amenityIds = formData.getAll('amenityIds') as string[];
        const validAmenityIds = amenityIds.filter(id => id && id.trim() !== '');

        // Validation cho UPDATE - Tất cả fields đều optional (theo API docs)
        // Chỉ validate các trường user đã nhập
        console.log('[updateRoomAction] Validation check (UPDATE - all fields optional):', {
            hotelId: !!hotelId,
            name: !!name,
            view: !!view,
            area: !!area,
            maxAdults: !!maxAdults,
            maxChildren: maxChildren !== null && maxChildren !== undefined,
            basePricePerNight: !!basePricePerNight,
            bedTypeName: !!bedTypeName,
            quantity: !!quantity,
            values: {
                hotelId,
                name,
                view,
                area,
                maxAdults,
                maxChildren,
                basePricePerNight,
                bedTypeName,
                quantity
            }
        });

        // UPDATE: Không cần validate bắt buộc - chỉ validate nếu user đã nhập
        // Nếu có trường nào được nhập, validate nó phải hợp lệ
        if (area && parseFloat(area) <= 0) {
            return { error: "Diện tích phải lớn hơn 0." };
        }
        if (maxAdults && parseInt(maxAdults) < 1) {
            return { error: "Số người lớn phải ít nhất 1." };
        }
        if (maxChildren && parseInt(maxChildren) < 0) {
            return { error: "Số trẻ em không được âm." };
        }
        if (basePricePerNight && parseFloat(basePricePerNight) <= 0) {
            return { error: "Giá phòng phải lớn hơn 0." };
        }
        if (quantity && parseInt(quantity) < 1) {
            return { error: "Số lượng phòng phải ít nhất 1." };
        }

        // Nếu có bedTypeName, validate nó
        if (bedTypeName && bedTypeName.trim()) {
            // Sẽ resolve bedTypeId sau
        }

        // Tìm bedType ID từ tên (chỉ nếu có bedTypeName)
        let bedTypeId: string | undefined = undefined;

        if (bedTypeName && bedTypeName.trim()) {
            // Cần hotelId để resolve bedTypeId
            // Nếu không có hotelId trong form, có thể lấy từ room data đã load
            if (!hotelId || !hotelId.trim()) {
                console.warn('[updateRoomAction] No hotelId in form, cannot resolve bedTypeId');
                // Có thể bỏ qua bedTypeId nếu không có hotelId
                // Hoặc lấy từ room data nếu có
            } else {
                console.log('[updateRoomAction] Finding bedType ID for name:', bedTypeName);
                const { findOrCreateBedTypeByName } = await import('@/lib/AdminAPI/bedTypeService');
                try {
                    bedTypeId = await findOrCreateBedTypeByName(bedTypeName.trim(), hotelId.trim());
                } catch (bedTypeError: any) {
                    console.error('[updateRoomAction] Error finding bedType:', bedTypeError);
                    return { error: bedTypeError.message || `Không tìm thấy loại giường "${bedTypeName}". Vui lòng sử dụng loại giường có sẵn.` };
                }
            }
        }

        console.log('[updateRoomAction] Creating payload for update:', {
            roomId,
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

        // Xây dựng payload (tất cả fields optional cho update)
        // CHỈ thêm các trường có giá trị
        const payload: Partial<CreateRoomPayload> = {};

        if (hotelId && hotelId.trim()) {
            payload.hotelId = hotelId.trim();
        }
        if (name && name.trim()) {
            payload.name = name.trim();
        }
        if (view && view.trim()) {
            payload.view = view.trim();
        }
        if (area && area.trim()) {
            payload.area = parseFloat(area);
        }
        if (maxAdults && maxAdults.trim()) {
            payload.maxAdults = parseInt(maxAdults);
        }
        if (maxChildren !== null && maxChildren !== undefined && maxChildren.trim() !== '') {
            payload.maxChildren = parseInt(maxChildren);
        }
        if (basePricePerNight && basePricePerNight.trim()) {
            payload.basePricePerNight = parseFloat(basePricePerNight);
        }
        if (bedTypeId) {
            payload.bedTypeId = bedTypeId;
        }
        if (quantity && quantity.trim()) {
            payload.quantity = parseInt(quantity);
        }

        // Status - Backend expect lowercase (active, inactive, maintenance, closed)
        // Frontend có thể dùng uppercase, cần convert
        if (status && status.trim()) {
            // Convert từ uppercase sang lowercase để match với backend pattern
            const statusLower = status.toLowerCase();
            // Map từ frontend values sang backend values
            const statusMap: Record<string, string> = {
                'available': 'active',
                'occupied': 'active', // OCCUPIED không có trong backend pattern, dùng active
                'maintenance': 'maintenance',
                'inactive': 'inactive',
                'closed': 'closed'
            };
            const backendStatus = statusMap[statusLower] || statusLower;
            // Backend expect status trong RoomUpdateRequest
            (payload as any).status = backendStatus;
        }

        // Boolean fields - chỉ thêm nếu có giá trị
        // Note: FormData.get() trả về 'true' string nếu checked, null nếu unchecked
        // Nếu checkbox không được check, không gửi field đó (optional)
        if (formData.has('smokingAllowed')) {
            payload.smokingAllowed = smokingAllowed;
        }
        if (formData.has('wifiAvailable')) {
            payload.wifiAvailable = wifiAvailable;
        }
        if (formData.has('breakfastIncluded')) {
            payload.breakfastIncluded = breakfastIncluded;
        }

        // Chỉ thêm photos nếu có
        if (validPhotos.length > 0) {
            payload.photos = validPhotos;
        }

        // Chỉ thêm amenityIds nếu có
        if (validAmenityIds.length > 0) {
            payload.amenityIds = validAmenityIds.map(id => id.trim());
        }

        // Log payload trước khi gọi server
        console.log("[updateRoomAction] ===== CLIENT-SIDE: Payload before calling server =====");
        console.log("[updateRoomAction] Payload:", {
            roomId,
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

        // Gọi API (server-side)
        const { updateRoomServer } = await import('@/lib/AdminAPI/roomService');
        await updateRoomServer(roomId, payload);

        console.log("[updateRoomAction] ===== CLIENT-SIDE: Room updated successfully =====");
        revalidatePath("/admin-rooms");
        revalidatePath(`/admin-rooms/${roomId}`);

        // Không redirect ở đây - để client redirect sau khi hiển thị toast
        // Client sẽ xử lý redirect sau khi hiển thị toast success
        return { success: true };
    } catch (error: any) {
        // Next.js redirect() throws a special error - don't treat it as an error
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            // Re-throw redirect errors so Next.js can handle them
            throw error;
        }

        console.error("=".repeat(80));
        console.error("[updateRoomAction] ===== CLIENT-SIDE ERROR =====");
        console.error("[updateRoomAction] Error:", error);
        console.error("[updateRoomAction] Error message:", error.message);
        console.error("=".repeat(80));
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
