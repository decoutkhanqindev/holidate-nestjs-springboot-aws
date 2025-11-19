"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import HotelForm from '@/components/Admin/hotels/HotelForm';
import { updateHotelActionSuperAdmin } from '@/lib/actions/hotelActions';
import type { Hotel } from '@/types';

interface EditHotelClientProps {
    hotel: Hotel;
}

export default function EditHotelClient({ hotel }: EditHotelClientProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            const result = await updateHotelActionSuperAdmin(hotel.id, formData);
            
            if (result?.error) {
                toast.error(result.error, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                return;
            }

            // Nếu thành công, hiển thị toast và redirect sau 1.5 giây
            if (result?.success) {
                toast.success('Cập nhật khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Refresh data và redirect sau khi toast hiển thị
                setTimeout(() => {
                    router.refresh();
                    router.push("/super-hotels");
                }, 1500);
            }
        } catch (error: any) {
            // Bỏ qua redirect error (nếu có) - không nên xảy ra nữa vì đã bỏ redirect trong server action
            if (error?.digest?.startsWith('NEXT_REDIRECT') || error.message === 'NEXT_REDIRECT') {
                // Nếu vẫn có NEXT_REDIRECT, coi như success
                toast.success('Cập nhật khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 1500,
                });
                setTimeout(() => {
                    router.push("/super-hotels");
                }, 1500);
                return;
            }
            
            console.error('[EditHotelClient] Error updating hotel:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật khách sạn', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return <HotelForm hotel={hotel} formAction={handleUpdate} isSuperAdmin={true} />;
}

