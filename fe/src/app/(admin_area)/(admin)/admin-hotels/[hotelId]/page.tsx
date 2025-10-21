// src/app/(admin)/hotels/[hotelId]/page.tsx
import { getHotelById } from '@/lib/AdminAPI/hotelService';
import { notFound } from 'next/navigation';
import EditHotelForm from '@/components/Admin/hotels/EditHotelForm';

interface EditHotelPageProps {
    params: { hotelId: string };
}

export default async function EditHotelPage({ params }: EditHotelPageProps) {
    const hotel = await getHotelById(params.hotelId);

    if (!hotel) {
        notFound();
    }

    return <EditHotelForm hotel={hotel} />;
}