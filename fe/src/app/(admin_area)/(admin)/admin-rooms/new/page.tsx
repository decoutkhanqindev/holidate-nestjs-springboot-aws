import { PageHeader } from "@/components/Admin/ui/PageHeader";
import RoomForm from "@/components/Admin/rooms/RoomForm";
import { getHotelById } from "@/lib/AdminAPI/hotelService";
import { createRoomAction } from "@/lib/actions/roomActions"; // Sẽ tạo file này
import { notFound } from "next/navigation";

interface NewRoomPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function NewRoomPage({ searchParams }: NewRoomPageProps) {
    const hotelId = searchParams.hotelId as string;
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