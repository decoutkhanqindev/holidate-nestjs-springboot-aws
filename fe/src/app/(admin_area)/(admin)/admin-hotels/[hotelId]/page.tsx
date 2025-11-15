// src/app/(admin)/hotels/[hotelId]/page.tsx
import { getHotelById, getHotelDetailById, type HotelPolicyResponse } from '@/lib/AdminAPI/hotelService';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/Admin/ui/PageHeader';
import { PencilIcon, ClockIcon, DocumentTextIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface HotelDetailPageProps {
    params: Promise<{ hotelId: string }>;
}

// Helper function để format time
const formatTime = (time: string) => {
    if (!time) return 'N/A';
    try {
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    } catch {
        return time;
    }
};

export default async function HotelDetailPage({ params }: HotelDetailPageProps) {
    // Await params trước khi sử dụng (Next.js 15+)
    const { hotelId } = await params;
    const hotel = await getHotelById(hotelId);
    const hotelDetail = await getHotelDetailById(hotelId);

    if (!hotel) {
        notFound();
    }

    // Lấy amenities từ hotelDetail
    const amenities = hotelDetail?.amenities || [];
    const flatAmenities = amenities.flatMap(cat => cat.amenities || []);

    // Lấy policy từ hotelDetail
    const policy = hotelDetail?.policy;
    
    // Debug: Log để kiểm tra
    console.log('[HotelDetailPage] Policy data:', policy);
    console.log('[HotelDetailPage] HotelDetail:', hotelDetail);

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

            {/* Tiện ích chính */}
            {flatAmenities.length > 0 && (
                <div className="bg-white rounded-lg shadow-md mt-4 p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Tiện ích chính
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {flatAmenities.map((amenity) => (
                            <div key={amenity.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-700">{amenity.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chính sách - Luôn hiển thị */}
            <div className="bg-white rounded-lg shadow-md mt-4 p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                    Chính sách khách sạn
                </h3>

                {policy ? (

                    <div className="space-y-6">
                        {/* Thời gian check-in/check-out */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                                <ClockIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Giờ nhận phòng</h4>
                                    <p className="text-gray-700">{formatTime(policy.checkInTime)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                                <ClockIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Giờ trả phòng</h4>
                                    <p className="text-gray-700">{formatTime(policy.checkOutTime)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Thanh toán tại khách sạn */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <svg className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Thanh toán tại khách sạn</h4>
                                <p className="text-gray-700">
                                    {policy.allowsPayAtHotel ? 'Có' : 'Không'}
                                </p>
                            </div>
                        </div>

                        {/* Giấy tờ yêu cầu */}
                        {policy.requiredIdentificationDocuments && policy.requiredIdentificationDocuments.length > 0 && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                                    Giấy tờ yêu cầu
                                </h4>
                                <ul className="space-y-2">
                                    {policy.requiredIdentificationDocuments.map((doc) => (
                                        <li key={doc.id} className="flex items-center gap-2 text-gray-700">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {doc.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Chính sách hủy */}
                        {policy.cancellationPolicy && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <XCircleIcon className="w-5 h-5 text-red-600" />
                                    Chính sách hủy phòng
                                </h4>
                                <p className="text-gray-700 mb-2">{policy.cancellationPolicy.name}</p>
                                <p className="text-sm text-gray-600">{policy.cancellationPolicy.description}</p>
                                {policy.cancellationPolicy.rules && policy.cancellationPolicy.rules.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        {policy.cancellationPolicy.rules.map((rule) => (
                                            <div key={rule.id} className="text-sm text-gray-600">
                                                {rule.daysBeforeCheckIn === 0 
                                                    ? 'Hủy ngay trước ngày nhận phòng' 
                                                    : `Hủy trước ${rule.daysBeforeCheckIn} ngày`}
                                                : {rule.penaltyPercentage === 0 ? ' Miễn phí' : ` Phí ${rule.penaltyPercentage}%`}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Chính sách đổi lịch */}
                        {policy.reschedulePolicy && (
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <ArrowPathIcon className="w-5 h-5 text-yellow-600" />
                                    Chính sách đổi lịch
                                </h4>
                                <p className="text-gray-700 mb-2">{policy.reschedulePolicy.name}</p>
                                <p className="text-sm text-gray-600">{policy.reschedulePolicy.description}</p>
                                {policy.reschedulePolicy.rules && policy.reschedulePolicy.rules.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        {policy.reschedulePolicy.rules.map((rule) => (
                                            <div key={rule.id} className="text-sm text-gray-600">
                                                {rule.daysBeforeCheckin === 0 
                                                    ? 'Đổi ngay trước ngày nhận phòng' 
                                                    : `Đổi trước ${rule.daysBeforeCheckin} ngày`}
                                                : {rule.feePercentage === 0 ? ' Miễn phí' : ` Phí ${rule.feePercentage}%`}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Khách sạn này chưa có chính sách được cấu hình.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}