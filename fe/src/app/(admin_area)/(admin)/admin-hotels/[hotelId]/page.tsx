// src/app/(admin)/hotels/[hotelId]/page.tsx
import { getHotelById } from '@/lib/AdminAPI/hotelService';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/Admin/ui/PageHeader';
import { PencilIcon } from '@heroicons/react/24/outline';

interface HotelDetailPageProps {
    params: Promise<{ hotelId: string }>;
}

export default async function HotelDetailPage({ params }: HotelDetailPageProps) {
    // Await params trước khi sử dụng (Next.js 15+)
    const { hotelId } = await params;
    const hotel = await getHotelById(hotelId);

    if (!hotel) {
        notFound();
    }

    return (
        <>
            <PageHeader title={`Chi tiết: ${hotel.name}`}>
                <Link
                    href={`/admin-hotels/${hotel.id}/edit`}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-all"
                >
                    <PencilIcon className="h-5 w-5" />
                    Chỉnh sửa
                </Link>
            </PageHeader>

            <div className="bg-white rounded-lg shadow-md mt-4 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        {hotel.imageUrl && (
                            <div className="mb-6">
                                <Image
                                    src={hotel.imageUrl}
                                    alt={hotel.name}
                                    width={600}
                                    height={400}
                                    className="rounded-lg object-cover w-full"
                                    unoptimized
                                />
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Số thứ tự</h3>
                                <p className="text-base text-gray-900">{hotel.stt || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Địa chỉ</h3>
                                <p className="text-base text-gray-900">{hotel.address}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Tên khách sạn</h3>
                            <p className="text-lg font-semibold text-gray-900">{hotel.name}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Mô tả</h3>
                            <p className="text-base text-gray-900">{hotel.description || 'Chưa có mô tả'}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${hotel.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                hotel.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {hotel.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}