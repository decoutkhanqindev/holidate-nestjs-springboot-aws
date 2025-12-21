// src/app/(super_admin)/super-hotels/[hotelId]/edit/page.tsx
import { getHotelByIdServer } from '@/lib/AdminAPI/hotelService';
import { notFound, redirect } from 'next/navigation';
import { PageHeader } from '@/components/Admin/ui/PageHeader';
import EditHotelClient from './EditHotelClient';

interface EditHotelPageProps {
    params: Promise<{ hotelId: string }>;
}

export default async function SuperEditHotelPage({ params }: EditHotelPageProps) {
    // Await params trước khi sử dụng (Next.js 15+)
    const { hotelId } = await params;
    
    try {
        // Dùng server version để lấy token từ cookies (không dùng localStorage)
        const hotel = await getHotelByIdServer(hotelId);

        if (!hotel) {
            notFound();
        }

        return (
            <>
                <PageHeader title={`Chỉnh sửa: ${hotel.name}`} />
                <EditHotelClient hotel={hotel} />
            </>
        );
    } catch (error: any) {
        
        // Nếu là lỗi authentication (401/403), redirect về login
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.error('[SuperEditHotelPage] Authentication/Authorization error (401/403), redirecting to login');
            redirect('/admin-login');
        }
        
        // Nếu error message có chứa "Token" hoặc "đăng nhập" và không phải là lỗi network
        if ((error.message?.includes('Token') || 
             error.message?.includes('đăng nhập') || 
             error.message?.includes('authentication')) &&
            !error.code &&
            !error.message?.includes('ECONNREFUSED') &&
            !error.message?.includes('ETIMEDOUT')) {
            redirect('/admin-login');
        }
        
        // Nếu là lỗi khác, throw để Next.js xử lý
        throw error;
    }
}

