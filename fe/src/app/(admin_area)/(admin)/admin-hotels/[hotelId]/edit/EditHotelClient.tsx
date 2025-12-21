"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import HotelForm from '@/components/Admin/hotels/HotelForm';
import { updateHotelAction } from '@/lib/actions/hotelActions';
import type { Hotel } from '@/types';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';

interface EditHotelClientProps {
    hotel: Hotel;
}

export default function EditHotelClient({ hotel }: EditHotelClientProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { effectiveUser } = useAuth();

    // Kiểm tra quyền - chỉ PARTNER mới được edit hotel
    useEffect(() => {
        if (effectiveUser) {
            const roleName = effectiveUser.role.name.toLowerCase();
            if (roleName !== 'partner') {
                toast.error('Chỉ PARTNER mới có quyền chỉnh sửa khách sạn', {
                    position: "top-right",
                    autoClose: 2000,
                });
                router.push('/admin-hotels');
            }
        }
    }, [effectiveUser, router]);

    const handleUpdate = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            const result = await updateHotelAction(hotel.id, formData);
            
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
                    router.push("/admin-hotels");
                }, 1500);
            }
        } catch (error: any) {
            // Bỏ qua redirect error (nếu có)
            if (error?.digest?.startsWith('NEXT_REDIRECT') || error.message === 'NEXT_REDIRECT') {
                toast.success('Cập nhật khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 1500,
                });
                setTimeout(() => {
                    router.push("/admin-hotels");
                }, 1500);
                return;
            }
            
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

    return <HotelForm hotel={hotel} formAction={handleUpdate} />;
}



