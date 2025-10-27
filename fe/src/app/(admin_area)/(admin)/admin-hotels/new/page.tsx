import HotelForm from "@/components/Admin/hotels/HotelForm";
import { createHotelAction } from "@/lib/actions/hotelActions";
import { PageHeader } from "@/components/Admin/ui/PageHeader";

export default function NewHotelPage() {
    return (
        <>
            <PageHeader title="Thêm khách sạn mới" />
            <HotelForm formAction={createHotelAction} />
        </>
    );
}