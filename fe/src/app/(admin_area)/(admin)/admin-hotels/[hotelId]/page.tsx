// src/app/(admin)/hotels/[hotelId]/page.tsx
import { getHotelById } from '@/lib/AdminAPI/hotelService';
import { notFound } from 'next/navigation';
import HotelForm from '@/components/Admin/hotels/HotelForm';
import { updateHotelAction } from '@/lib/actions/hotelActions';
import { PageHeader } from '@/components/Admin/ui/PageHeader';

interface EditHotelPageProps {
    params: { hotelId: string };
}

export default async function EditHotelPage({ params }: EditHotelPageProps) {
    const hotel = await getHotelById(params.hotelId);

    if (!hotel) {
        notFound();
    }

    // Dùng .bind để truyền sẵn hotelId vào server action mà không cần input ẩn
    const updateActionWithId = updateHotelAction.bind(null, hotel.id);

    return (
        <>
            <PageHeader title={`Chỉnh sửa: ${hotel.name}`} />
            <HotelForm hotel={hotel} formAction={updateActionWithId} />
        </>
    );
}