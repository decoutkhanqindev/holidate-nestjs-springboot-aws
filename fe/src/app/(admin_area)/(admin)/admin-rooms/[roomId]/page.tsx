// app/admin-rooms/[roomId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getRoomById } from '@/lib/AdminAPI/roomService';
import { updateRoomAction } from '@/lib/actions/roomActions';
import RoomForm from '@/components/Admin/rooms/RoomForm';

function PageHeader({ title }: { title: React.ReactNode }) {
    return (
        <div className="mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        </div>
    );
}

export default function EditRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const [room, setRoom] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadRoom() {
            setIsLoading(true);
            setError(null);
            try {
                console.log("[EditRoomPage] Loading room:", roomId);
                const roomData = await getRoomById(roomId);

                if (!roomData) {
                    setError('Không tìm thấy phòng.');
                    return;
                }

                console.log("[EditRoomPage] Room data loaded:", roomData);
                console.log("[EditRoomPage] Room data keys:", Object.keys(roomData));
                console.log("[EditRoomPage] Room data values:", {
                    id: roomData.id,
                    hotelId: roomData.hotelId,
                    name: roomData.name,
                    view: roomData.view,
                    area: roomData.area,
                    maxAdults: roomData.maxAdults,
                    maxChildren: roomData.maxChildren,
                    basePricePerNight: roomData.basePricePerNight,
                    bedType: roomData.bedType,
                    quantity: roomData.quantity,
                    amenities: roomData.amenities,
                    photos: roomData.photos,
                });

                // Map RoomResponse sang format mà RoomForm cần
                // Lấy hotelId từ hotel.id hoặc hotelId (backward compatibility)
                const hotelId = roomData.hotel?.id || roomData.hotelId || '';
                console.log("[EditRoomPage] Extracted hotelId:", hotelId, "from hotel:", roomData.hotel);

                const mappedRoom = {
                    id: roomData.id,
                    hotelId: hotelId,
                    name: roomData.name || '',
                    view: roomData.view || '',
                    area: roomData.area || 0,
                    maxAdults: roomData.maxAdults || 0,
                    maxChildren: roomData.maxChildren ?? 0, // Dùng ?? để phân biệt 0 và undefined
                    basePricePerNight: roomData.basePricePerNight || 0,
                    bedType: roomData.bedType ? {
                        id: roomData.bedType.id,
                        name: roomData.bedType.name
                    } : undefined,
                    smokingAllowed: roomData.smokingAllowed ?? false,
                    wifiAvailable: roomData.wifiAvailable ?? false,
                    breakfastIncluded: roomData.breakfastIncluded ?? false,
                    quantity: roomData.quantity || 0,
                    // Map status từ backend (lowercase) sang frontend (uppercase)
                    status: (() => {
                        const statusMap: Record<string, string> = {
                            'active': 'AVAILABLE',
                            'inactive': 'INACTIVE',
                            'maintenance': 'MAINTENANCE',
                            'closed': 'CLOSED',
                            'occupied': 'OCCUPIED',
                            'AVAILABLE': 'AVAILABLE',
                            'INACTIVE': 'INACTIVE',
                            'MAINTENANCE': 'MAINTENANCE',
                            'CLOSED': 'CLOSED',
                            'OCCUPIED': 'OCCUPIED'
                        };
                        const rawStatus = roomData.status || 'active';
                        return statusMap[rawStatus] || 'AVAILABLE';
                    })(),
                    // Map amenities từ nested structure
                    amenities: roomData.amenities?.flatMap((cat: any) =>
                        cat.amenities?.map((a: any) => ({ id: a.id, name: a.name })) || []
                    ) || [],
                    // Map photos từ nested structure
                    photos: roomData.photos?.flatMap((cat: any) =>
                        cat.photos?.map((p: any) => ({ id: p.id, url: p.url })) || []
                    ) || [],
                    images: roomData.photos?.flatMap((cat: any) =>
                        cat.photos?.map((p: any) => p.url) || []
                    ) || [],
                };

                console.log("[EditRoomPage] Mapped room:", mappedRoom);
                setRoom(mappedRoom);
            } catch (err: any) {
                console.error("[EditRoomPage] Error loading room:", err);
                setError(err.message || 'Không thể tải thông tin phòng.');
            } finally {
                setIsLoading(false);
            }
        }

        if (roomId) {
            loadRoom();
        }
    }, [roomId]);

    const handleUpdate = async (formData: FormData) => {
        try {
            const result = await updateRoomAction(roomId, formData);
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
                toast.success("Cập nhật phòng thành công!", {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Redirect sau khi toast hiển thị với query param để force refresh
                setTimeout(() => {
                    // Thêm query param refresh=1 để trigger refresh data
                    router.push("/admin-rooms?refresh=1");
                }, 1500);
            }
        } catch (error: any) {
            // Bỏ qua redirect error (nếu có)
            if (error?.digest?.startsWith('NEXT_REDIRECT')) {
                return;
            }
            toast.error("Có lỗi xảy ra khi cập nhật phòng", {
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
                <PageHeader title={<span style={{ color: '#2563eb' }}>Chỉnh sửa phòng</span>} />
                <div className="text-center py-8 text-gray-500">
                    Đang tải thông tin phòng...
                </div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div>
                <PageHeader title={<span style={{ color: '#2563eb' }}>Chỉnh sửa phòng</span>} />
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error || 'Không tìm thấy phòng.'}
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader title={<span style={{ color: '#2563eb' }}>Chỉnh sửa phòng: {room.name}</span>} />
            <RoomForm
                formAction={handleUpdate}
                hotelId={room.hotelId}
                room={room}
            />
        </div>
    );
}
