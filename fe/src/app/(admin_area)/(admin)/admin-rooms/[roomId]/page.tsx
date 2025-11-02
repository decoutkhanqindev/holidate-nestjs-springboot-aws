// app/admin-rooms/[roomId]/page.tsx
import { getRoomById } from '@/lib/AdminAPI/roomService'; // Hàm này bạn cần tạo
import { PageHeader } from '@/components/Admin/ui/PageHeader';
// import RoomForm from '@/components/Admin/rooms/RoomForm'; // Component form sẽ tạo sau

// Giả lập hàm lấy dữ liệu phòng theo ID
async function getRoom(id: string) {
    // const room = await getRoomById(id);
    // if (!room) return null;
    // return room;

    // Dữ liệu mẫu để test
    console.log("Fetching room with id:", id);
    return {
        id,
        name: `Phòng ${id}`,
        type: 'Standard',
        price: 500000,
        image: '',
        status: 'AVAILABLE'
    };
}


export default async function EditRoomPage({ params }: { params: { roomId: string } }) {
    const { roomId } = params;
    const room = await getRoom(roomId);

    if (!room) {
        return <div>Không tìm thấy phòng.</div>;
    }

    return (
        <>
            <PageHeader title={`Chỉnh sửa thông tin phòng: ${room.name}`} />

            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                {/* 
                    Component form sẽ được đặt ở đây.
                    <RoomForm room={room} /> 
                */}
                <p>Đây là trang để chỉnh sửa phòng có ID: <strong>{room.id}</strong></p>
                <p>Form chỉnh sửa sẽ được tích hợp vào đây.</p>
            </div>
        </>
    );
}