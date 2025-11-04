import { PageHeader } from "@/components/Admin/ui/PageHeader";
import RoomForm from "@/components/Admin/rooms/RoomForm";
import { getHotelById } from "@/lib/AdminAPI/hotelService";
import { createRoomAction } from "@/lib/actions/roomActions"; // Sẽ tạo file này
import { notFound } from "next/navigation";

interface NewRoomPageProps {
    searchParams: Promise<{ hotelId?: string }>;
}

export default async function NewRoomPage({ searchParams }: NewRoomPageProps) {
    // Await searchParams trước khi sử dụng (Next.js 15+)
    const params = await searchParams;
    const hotelId = params.hotelId as string;
    if (!hotelId) {
        return <div>Lỗi: Không tìm thấy ID khách sạn. Vui lòng quay lại.</div>;
    }

    const hotel = await getHotelById(hotelId);
    if (!hotel) {
        return notFound();
    }

    return (
        <>
            <PageHeader title={`Thêm phòng mới cho: ${hotel.name}`} />
            <RoomForm formAction={createRoomAction} hotelId={hotelId} />
        </>
    );
}