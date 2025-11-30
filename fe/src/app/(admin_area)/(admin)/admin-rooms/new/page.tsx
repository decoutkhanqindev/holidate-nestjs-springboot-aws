"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { PageHeader } from "@/components/Admin/ui/PageHeader";
import RoomForm from "@/components/Admin/rooms/RoomForm";
import { getHotelById } from "@/lib/AdminAPI/hotelService";
import { createRoomAction } from "@/lib/actions/roomActions";

export default function NewRoomPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hotelId = searchParams.get('hotelId');

    const [hotel, setHotel] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadHotel() {
            if (!hotelId) {
                setError('Không tìm thấy ID khách sạn. Vui lòng quay lại.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const hotelData = await getHotelById(hotelId);
                if (!hotelData) {
                    setError('Không tìm thấy khách sạn.');
                    return;
                }
                setHotel(hotelData);
            } catch (err: any) {
                setError(err.message || 'Không thể tải thông tin khách sạn.');
            } finally {
                setIsLoading(false);
            }
        }

        loadHotel();
    }, [hotelId]);

    const handleCreate = async (formData: FormData) => {
        try {
            const result = await createRoomAction(formData);
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
                toast.success("Tạo phòng thành công!", {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Redirect sau khi toast hiển thị
                setTimeout(() => {
                    router.push("/admin-rooms");
                }, 1500);
            }
        } catch (error: any) {
            // Bỏ qua redirect error (nếu có)
            if (error?.digest?.startsWith('NEXT_REDIRECT')) {
                return;
            }
            toast.error("Có lỗi xảy ra khi tạo phòng", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Thêm phòng mới" />
                <div className="text-center py-8 text-gray-500">
                    Đang tải thông tin khách sạn...
                </div>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div>
                <PageHeader title="Thêm phòng mới" />
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error || 'Không tìm thấy khách sạn.'}
                </div>
            </div>
        );
    }

    return (
        <>
            <PageHeader title={`Thêm phòng mới cho: ${hotel.name}`} />
            <RoomForm formAction={handleCreate} hotelId={hotelId!} />
        </>
    );
}