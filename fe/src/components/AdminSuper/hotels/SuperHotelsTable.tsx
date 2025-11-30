"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Hotel, HotelStatus } from '@/types';
import { deleteHotelAction } from '@/lib/actions/hotelActions';
import { getHotelAdmins } from '@/lib/Super_Admin/hotelAdminService';
import { toast } from 'react-toastify';

// Component StatusBadge với text tiếng Việt
function StatusBadge({ status }: { status: HotelStatus }) {
    const statusStyles: Record<HotelStatus, string> = {
        ACTIVE: "bg-green-100 text-green-800",
        PENDING: "bg-yellow-100 text-yellow-800",
        HIDDEN: "bg-gray-100 text-gray-800",
    };
    const statusText: Record<HotelStatus, string> = {
        ACTIVE: "Đang hoạt động",
        PENDING: "Chờ duyệt",
        HIDDEN: "Đã ẩn",
    };
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {statusText[status]}
        </span>
    );
}

interface SuperHotelsTableProps {
    hotels: Hotel[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    selectedPartnerId?: string;
    onPartnerChange?: (partnerId: string) => void;
}

export default function SuperHotelsTable({
    hotels,
    currentPage,
    totalPages,
    totalItems,
    selectedPartnerId = '',
    onPartnerChange
}: SuperHotelsTableProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [partners, setPartners] = useState<any[]>([]);
    const [isLoadingPartners, setIsLoadingPartners] = useState(false);
    // Lưu partners với UUID string để dùng trong dropdown filter
    const [partnersWithUuid, setPartnersWithUuid] = useState<Array<{ id: string; uuid: string; username: string; email: string }>>([]);

    // Load partners CHỈ để hiển thị trong dropdown filter
    useEffect(() => {
        const loadPartners = async () => {
            setIsLoadingPartners(true);
            try {
                const response = await getHotelAdmins({ page: 1, limit: 1000 });
                setPartners(response.data);

                // Lưu partners với UUID string để dùng trong dropdown filter
                const partnersWithUuidList: Array<{ id: string; uuid: string; username: string; email: string }> = [];

                // Fetch raw users data để lấy UUID string
                try {
                    const { default: apiClient } = await import('@/service/apiClient');
                    const usersResponse = await apiClient.get('/users');
                    const rawUsers = usersResponse.data?.data || [];

                    // Filter chỉ PARTNER role và map UUID string
                    rawUsers.forEach((user: any) => {
                        if (user.role?.name === 'PARTNER' || user.role?.name === 'partner') {
                            const uuidId = user.id; // UUID string từ backend
                            // Tìm partner tương ứng trong response.data (đã parsed)
                            const parsedPartner = response.data.find(p => {
                                // So sánh bằng email hoặc username
                                return p.email === user.email || p.username === user.fullName;
                            });

                            if (parsedPartner) {
                                partnersWithUuidList.push({
                                    id: parsedPartner.id.toString(), // Number ID (để tương thích)
                                    uuid: uuidId, // UUID string (để filter)
                                    username: parsedPartner.username || user.fullName,
                                    email: parsedPartner.email || user.email
                                });
                            } else {
                                // Nếu không tìm thấy trong parsed list, dùng raw data
                                partnersWithUuidList.push({
                                    id: '0', // Fallback
                                    uuid: uuidId,
                                    username: user.fullName || user.email,
                                    email: user.email
                                });
                            }
                        }
                    });
                } catch (error) {
                    // Fallback: dùng number ID
                    response.data.forEach(partner => {
                        const idStr = partner.id.toString();
                        partnersWithUuidList.push({
                            id: idStr,
                            uuid: idStr, // Fallback: dùng chính nó
                            username: partner.username,
                            email: partner.email
                        });
                    });
                }

                setPartnersWithUuid(partnersWithUuidList);
            } catch (error) {
                // Error loading partners
            } finally {
                setIsLoadingPartners(false);
            }
        };

        loadPartners();
    }, []); // Chỉ load một lần khi component mount

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa khách sạn "${name}" không?`)) {
            return;
        }

        setIsDeleting(id);
        try {
            const result = await deleteHotelAction(id);
            if (result?.success) {
                toast.success('Xóa khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                router.refresh();
            } else {
                toast.error(result?.error || 'Không thể xóa khách sạn. Vui lòng thử lại.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa khách sạn. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className={`mt-6 bg-white rounded-lg shadow-md overflow-hidden ${isDeleting ? "opacity-50" : "opacity-100"}`}>
            {/* Filter Partner */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-4 flex-wrap">
                    <label htmlFor="partnerFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Chọn tài khoản Partner:
                    </label>
                    <select
                        id="partnerFilter"
                        value={selectedPartnerId}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            onPartnerChange?.(newValue);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[300px]"
                        disabled={isLoadingPartners}
                    >
                        <option value="">Tất cả Partners</option>
                        {partnersWithUuid.map(partner => (
                            <option key={partner.uuid} value={partner.uuid}>
                                {partner.username} ({partner.email})
                            </option>
                        ))}
                    </select>
                    {selectedPartnerId && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                Đã chọn: <span className="font-medium text-blue-600">
                                    {partnersWithUuid.find(p => p.uuid === selectedPartnerId)?.username || selectedPartnerId}
                                </span>
                            </span>
                            <button
                                onClick={() => {
                                    onPartnerChange?.('');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                STT
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                TÊN KHÁCH SẠN
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '350px' }}>
                                ĐỊA CHỈ
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ẢNH
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                TRẠNG THÁI
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                HÀNH ĐỘNG
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {hotels.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                    Không có khách sạn nào
                                </td>
                            </tr>
                        ) : (
                            hotels.map((hotel, index) => {
                                // Tính STT dựa trên currentPage (1-based)
                                const startIndex = (currentPage - 1) * 10;
                                return (
                                <tr key={hotel.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-600" style={{ maxWidth: '350px' }}>
                                        <div
                                            className="line-clamp-2 break-words"
                                            title={hotel.address}
                                            style={{
                                                maxWidth: '350px',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {hotel.address}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {hotel.imageUrl ? (
                                            <div className="flex-shrink-0 h-16 w-24 flex items-center justify-center overflow-hidden rounded-md">
                                                <Image
                                                    className="h-full w-full object-cover"
                                                    src={hotel.imageUrl}
                                                    alt={hotel.name}
                                                    width={96}
                                                    height={64}
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-shrink-0 h-16 w-24 flex items-center justify-center bg-gray-100 rounded-md">
                                                <span className="text-xs text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {hotel.status ? (
                                            <StatusBadge status={hotel.status} />
                                        ) : (
                                            <StatusBadge status="ACTIVE" />
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center justify-end gap-x-2">
                                            <button
                                                onClick={() => {
                                                    // Navigate đến trang detail (detail page sẽ tự fetch partner info)
                                                    router.push(`/super-hotels/${hotel.id}`);
                                                }}
                                                className="p-2 bg-gray-100 text-green-600 hover:bg-gray-200 rounded-md transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            {/* Super-admin chỉ xem, không edit - quyền edit chỉ dành cho PARTNER */}
                                            <button
                                                onClick={() => handleDelete(hotel.id, hotel.name)}
                                                disabled={isDeleting === hotel.id}
                                                className="p-2 bg-gray-100 text-red-600 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-100 rounded-md transition-colors"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

