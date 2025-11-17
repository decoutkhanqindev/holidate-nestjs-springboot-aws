"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHotelServer, updateHotelServer, deleteHotelServer } from "@/lib/AdminAPI/hotelService";
import type { HotelStatus } from "@/types";

// ACTION ĐỂ TẠO KHÁCH SẠN MỚI
// noRedirect: nếu true, không redirect (dùng cho modal)
export async function createHotelAction(formData: FormData, noRedirect: boolean = false) {
    try {
        const name = formData.get('name') as string;
        const address = formData.get('address') as string; // Có thể optional
        const description = formData.get('description') as string;

        // Lấy các field location - PHẢI CÓ ID từ dropdown
        const countryId = formData.get('countryId') as string;
        const provinceId = formData.get('provinceId') as string;
        const cityId = formData.get('cityId') as string;
        const districtId = formData.get('districtId') as string;
        const wardId = formData.get('wardId') as string;
        const streetId = formData.get('streetId') as string;
        const partnerId = formData.get('partnerId') as string;
        
        // Lấy commission_rate từ formData hoặc dùng giá trị mặc định 15% (15)
        const commissionRateStr = formData.get('commissionRate') as string;
        const commissionRate = commissionRateStr ? parseFloat(commissionRateStr) : 15;

        // Validation
        if (!name) {
            return { error: "Tên khách sạn là bắt buộc." };
        }

        // Validate required fields cho API - TẤT CẢ PHẢI CÓ ID (trừ address có thể optional)
        if (!countryId || !provinceId || !cityId || !districtId || !wardId || !streetId || !partnerId) {
            return { error: "Vui lòng điền đầy đủ thông tin địa chỉ (chọn từ danh sách) và đối tác." };
        }

        console.log('[createHotelAction] Creating hotel with location IDs:', {
            countryId, provinceId, cityId, districtId, wardId, streetId, partnerId
        });

        // Xây dựng JSON payload để gửi lên API (CREATE dùng JSON)
        // Note: description là required trong API docs, không được để rỗng
        // address có thể optional, nhưng API có thể yêu cầu, nên dùng giá trị mặc định nếu không có
        // Nếu không có address nhưng có streetId, có thể để rỗng hoặc dùng giá trị mặc định
        const payload = {
            name: name.trim(),
            description: (description && description.trim()) || 'Không có mô tả',
            address: (address && address.trim()) || 'Chưa có địa chỉ',
            countryId: countryId.trim(),
            provinceId: provinceId.trim(),
            cityId: cityId.trim(),
            districtId: districtId.trim(),
            wardId: wardId.trim(),
            streetId: streetId.trim(),
            partnerId: partnerId.trim(),
            commissionRate: commissionRate,
        };

        console.log('[createHotelAction] Final payload before sending:', JSON.stringify(payload, null, 2));

        // Lấy các ảnh từ FormData
        const images = formData.getAll('images') as File[];
        const validImages = images.filter((img) => img instanceof File && img.size > 0);

        console.log('[createHotelAction] Images to upload:', validImages.length);

        // Dùng createHotelServer với images (dành cho server actions - lấy token từ cookies)
        const createdHotel = await createHotelServer(payload, validImages);

        // Sau khi tạo hotel, update với amenities và entertainment venues (nếu có)
        const amenityIdsToAdd = formData.getAll('amenityIdsToAdd[]');
        const hasVenues = formData.has('entertainmentVenuesWithDistanceToAdd[0].entertainmentVenueId') || 
                         formData.has('entertainmentVenuesToAdd[0].name');
        
        if (amenityIdsToAdd.length > 0 || hasVenues) {
            console.log('[createHotelAction] Updating hotel with amenities and venues after creation');
            // Tạo FormData mới chỉ với amenities và venues
            const updateFormData = new FormData();
            
            // Append amenities
            amenityIdsToAdd.forEach((amenityId) => {
                if (amenityId && amenityId.toString().trim() !== '') {
                    updateFormData.append('amenityIdsToAdd[]', amenityId.toString().trim());
                }
            });

            // Append entertainment venues có sẵn
            const venueIndices = new Set<number>();
            formData.forEach((value, key) => {
                const match = key.match(/^entertainmentVenuesWithDistanceToAdd\[(\d+)\]\.(entertainmentVenueId|distance)$/);
                if (match) {
                    venueIndices.add(parseInt(match[1]));
                }
            });
            venueIndices.forEach((index) => {
                const venueId = formData.get(`entertainmentVenuesWithDistanceToAdd[${index}].entertainmentVenueId`);
                const distance = formData.get(`entertainmentVenuesWithDistanceToAdd[${index}].distance`);
                if (venueId && distance) {
                    updateFormData.append(`entertainmentVenuesWithDistanceToAdd[${index}].entertainmentVenueId`, venueId.toString());
                    updateFormData.append(`entertainmentVenuesWithDistanceToAdd[${index}].distance`, distance.toString());
                }
            });

            // Append entertainment venues mới
            const newVenueIndices = new Set<number>();
            formData.forEach((value, key) => {
                const match = key.match(/^entertainmentVenuesToAdd\[(\d+)\]\.(name|distance|cityId|categoryId)$/);
                if (match) {
                    newVenueIndices.add(parseInt(match[1]));
                }
            });
            newVenueIndices.forEach((index) => {
                const name = formData.get(`entertainmentVenuesToAdd[${index}].name`);
                const distance = formData.get(`entertainmentVenuesToAdd[${index}].distance`);
                const cityId = formData.get(`entertainmentVenuesToAdd[${index}].cityId`);
                const categoryId = formData.get(`entertainmentVenuesToAdd[${index}].categoryId`);
                if (name && distance && cityId && categoryId) {
                    updateFormData.append(`entertainmentVenuesToAdd[${index}].name`, name.toString());
                    updateFormData.append(`entertainmentVenuesToAdd[${index}].distance`, distance.toString());
                    updateFormData.append(`entertainmentVenuesToAdd[${index}].cityId`, cityId.toString());
                    updateFormData.append(`entertainmentVenuesToAdd[${index}].categoryId`, categoryId.toString());
                }
            });

            // Update hotel với amenities và venues
            await updateHotelServer(createdHotel.id, updateFormData);
            console.log('[createHotelAction] Hotel updated with amenities and venues');
        }

        revalidatePath("/admin-hotels");
        revalidatePath("/super-hotels");
        
        // Nếu noRedirect, không redirect (dùng cho modal)
        if (noRedirect) {
            return { success: true };
        }
        
        redirect("/admin-hotels");
    } catch (error: any) {
        console.error("[createHotelAction] Error:", error);
        // NEXT_REDIRECT không phải là error thực sự, chỉ là cách Next.js redirect
        if (error.message === 'NEXT_REDIRECT' || error.digest?.includes('NEXT_REDIRECT')) {
            // Nếu là redirect và noRedirect = true, thì coi như success
            if (noRedirect) {
                return { success: true };
            }
            throw error; // Re-throw để Next.js xử lý redirect
        }
        return { error: error.message || "Không thể tạo khách sạn. Vui lòng thử lại." };
    }
}

// ACTION ĐỂ CẬP NHẬT KHÁCH SẠN (không redirect, để client tự xử lý)
// Backend yêu cầu multipart/form-data, nên phải truyền FormData trực tiếp
export async function updateHotelAction(id: string, formData: FormData) {
    try {
        // Validation - chỉ validate name (address có thể optional)
        const name = formData.get('name') as string;

        if (!name || name.trim() === '') {
            return { error: "Tên khách sạn là bắt buộc." };
        }

        // Backend yêu cầu multipart/form-data, nên truyền FormData trực tiếp
        // Dùng updateHotelServer (server version) để lấy token từ cookies
        await updateHotelServer(id, formData);

        revalidatePath("/admin-hotels");
        revalidatePath(`/admin-hotels/${id}`);
        revalidatePath("/super-hotels"); // Cũng revalidate super-hotels để đồng bộ
        
        // Không redirect ở đây - để client component tự xử lý redirect sau khi hiển thị toast
        return { success: true };
    } catch (error: any) {
        console.error("[updateHotelAction] Error:", error);
        // NEXT_REDIRECT không phải là error thực sự
        if (error?.digest?.startsWith('NEXT_REDIRECT') || error.message === 'NEXT_REDIRECT') {
            return { success: true };
        }
        return { error: error.message || "Không thể cập nhật khách sạn. Vui lòng thử lại." };
    }
}

// ACTION ĐỂ CẬP NHẬT KHÁCH SẠN (Dành cho Super Admin - không redirect, để client tự xử lý)
// Backend yêu cầu multipart/form-data, nên phải truyền FormData trực tiếp
export async function updateHotelActionSuperAdmin(id: string, formData: FormData) {
    try {
        // Validation - chỉ validate name (address có thể optional)
        const name = formData.get('name') as string;

        if (!name || name.trim() === '') {
            return { error: "Tên khách sạn là bắt buộc." };
        }

        // Backend yêu cầu multipart/form-data, nên truyền FormData trực tiếp
        // Dùng updateHotelServer (server version) để lấy token từ cookies
        await updateHotelServer(id, formData);

        revalidatePath("/super-hotels");
        revalidatePath(`/super-hotels/${id}`);
        revalidatePath("/admin-hotels"); // Cũng revalidate admin-hotels để đồng bộ
        
        // Không redirect ở đây - để client component tự xử lý redirect sau khi hiển thị toast
        return { success: true };
    } catch (error: any) {
        console.error("[updateHotelActionSuperAdmin] Error:", error);
        // NEXT_REDIRECT không phải là error thực sự
        if (error?.digest?.startsWith('NEXT_REDIRECT') || error.message === 'NEXT_REDIRECT') {
            return { success: true };
        }
        return { error: error.message || "Không thể cập nhật khách sạn. Vui lòng thử lại." };
    }
}

// ACTION ĐỂ XÓA KHÁCH SẠN
export async function deleteHotelAction(id: string) {
    try {
        // Dùng deleteHotelServer (server version) để lấy token từ cookies
        await deleteHotelServer(id);
        revalidatePath("/admin-hotels");
        revalidatePath("/super-hotels");
        return { success: true };
    } catch (error: any) {
        console.error("[deleteHotelAction] Error:", error);
        return { success: false, error: error.message || "Xóa khách sạn thất bại." };
    }
}