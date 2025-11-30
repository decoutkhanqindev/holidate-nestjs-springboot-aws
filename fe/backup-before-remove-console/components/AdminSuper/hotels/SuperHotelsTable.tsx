"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Hotel, HotelStatus } from '@/types';
import { deleteHotelAction } from '@/lib/actions/hotelActions';
import { getHotelAdmins } from '@/lib/Super_Admin/hotelAdminService';
import { getHotelById } from '@/lib/AdminAPI/hotelService';
import type { HotelAdmin } from '@/types';
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
    const [partners, setPartners] = useState<HotelAdmin[]>([]);
    const [isLoadingPartners, setIsLoadingPartners] = useState(false);
    const [partnerMap, setPartnerMap] = useState<Map<string, { name: string; email: string; id: string }>>(new Map());
    const [hotelOwnerMap, setHotelOwnerMap] = useState<Map<string, { id: string; name: string; email?: string }>>(new Map()); // Map hotelId -> owner info
    // Lưu partners với UUID string để dùng trong dropdown
    const [partnersWithUuid, setPartnersWithUuid] = useState<Array<{ id: string; uuid: string; username: string; email: string }>>([]);

    // Load partners để hiển thị trong dropdown và map với hotels
    useEffect(() => {
        const loadPartners = async () => {
            setIsLoadingPartners(true);
            try {
                const response = await getHotelAdmins({ page: 1, limit: 1000 });
                setPartners(response.data);

                // Tạo map partnerId (UUID string) -> partner info để lookup nhanh
                const map = new Map<string, { name: string; email: string; id: string }>();
                // Lưu partners với UUID string để dùng trong dropdown
                const partnersWithUuidList: Array<{ id: string; uuid: string; username: string; email: string }> = [];

                // Fetch raw users data để lấy UUID string
                try {
                    const { default: apiClient } = await import('@/service/apiClient');
                    const usersResponse = await apiClient.get('/users');
                    const rawUsers = usersResponse.data?.data || [];

                    // Filter chỉ PARTNER role và map UUID string -> partner info
                    rawUsers.forEach((user: any) => {
                        if (user.role?.name === 'PARTNER' || user.role?.name === 'partner') {
                            const uuidId = user.id; // UUID string từ backend
                            // Tìm partner tương ứng trong response.data (đã parsed)
                            const parsedPartner = response.data.find(p => {
                                // So sánh bằng email hoặc username
                                return p.email === user.email || p.username === user.fullName;
                            });

                            if (parsedPartner) {
                                map.set(uuidId, {
                                    name: parsedPartner.username || user.fullName,
                                    email: parsedPartner.email || user.email,
                                    id: uuidId
                                });

                                // Lưu partner với UUID để dùng trong dropdown
                                partnersWithUuidList.push({
                                    id: parsedPartner.id.toString(), // Number ID (để tương thích)
                                    uuid: uuidId, // UUID string (để filter)
                                    username: parsedPartner.username || user.fullName,
                                    email: parsedPartner.email || user.email
                                });
                            } else {
                                // Nếu không tìm thấy trong parsed list, dùng raw data
                                map.set(uuidId, {
                                    name: user.fullName || user.email,
                                    email: user.email,
                                    id: uuidId
                                });

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
                    // Fallback: map với number ID
                    response.data.forEach(partner => {
                        const idStr = partner.id.toString();
                        map.set(idStr, {
                            name: partner.username,
                            email: partner.email,
                            id: idStr
                        });

                        partnersWithUuidList.push({
                            id: idStr,
                            uuid: idStr, // Fallback: dùng chính nó
                            username: partner.username,
                            email: partner.email
                        });
                    });
                }

                setPartnerMap(map);
                setPartnersWithUuid(partnersWithUuidList);
            } catch (error) {
                // Error loading partners
            } finally {
                setIsLoadingPartners(false);
            }
        };

        loadPartners();
    }, [hotels]); // Thêm hotels vào dependency để log khi hotels thay đổi

    // Map owner info từ partnerMap cho hotels có ownerId nhưng chưa có ownerName
    // Tách riêng để tránh conflict với fetch API
    useEffect(() => {
        if (partnerMap.size === 0 || hotels.length === 0) return;

        setHotelOwnerMap(prev => {
            const newOwnerMap = new Map(prev);
            let hasUpdate = false;

            hotels.forEach(hotel => {
                // Chỉ map nếu:
                // 1. Có ownerId
                // 2. Chưa có ownerName (list API không trả về)
                // 3. Chưa có trong hotelOwnerMap
                if (hotel.ownerId && !hotel.ownerName && !newOwnerMap.has(hotel.id)) {
                    // Tìm trong partnerMap (đã map với UUID string)
                    const partnerInfo = partnerMap.get(hotel.ownerId);

                    if (partnerInfo) {
                        newOwnerMap.set(hotel.id, {
                            id: hotel.ownerId,
                            name: partnerInfo.name,
                            email: partnerInfo.email
                        });
                        hasUpdate = true;
                    } else {
                        // Fallback: tìm trong partners list (number ID)
                        const partner = partners.find(p => {
                            const pIdStr = p.id.toString();
                            const ownerIdStr = String(hotel.ownerId);
                            return pIdStr === ownerIdStr;
                        });

                        if (partner) {
                            newOwnerMap.set(hotel.id, {
                                id: hotel.ownerId,
                                name: partner.username,
                                email: partner.email
                            });
                            hasUpdate = true;
                        }
                    }
                }
            });

            return hasUpdate ? newOwnerMap : prev;
        });
    }, [hotels, partnerMap, partners]); // Dùng functional update để tránh dependency loop

    // Fetch owner info CHỈ cho hotels CHƯA CÓ ownerName và CHƯA MAP được từ partnerMap
    useEffect(() => {
        const fetchOwnerInfo = async () => {
            // CHỈ fetch detail cho hotels:
            // 1. Chưa có ownerName (list API không trả về partner info)
            // 2. Chưa có trong hotelOwnerMap (chưa map hoặc fetch)
            // KHÔNG cần ownerId vì có thể hotel có partner nhưng list API không trả về
            const hotelsToFetch = hotels.filter(h => {
                return !h.ownerName &&
                    !hotelOwnerMap.has(h.id);
            });

            if (hotelsToFetch.length === 0) {
                return;
            }

            // Fetch detail cho từng hotel để lấy partner info
            const ownerMap = new Map<string, { id: string; name: string; email?: string }>();

            await Promise.allSettled(
                hotelsToFetch.map(async (hotel) => {
                    try {
                        // Fetch trực tiếp từ API để lấy partner object đầy đủ
                        const { default: apiClient } = await import('@/service/apiClient');
                        const detailResponse = await apiClient.get(`/accommodation/hotels/${hotel.id}`);
                        const detailData = detailResponse.data?.data;

                        // Nếu có partner trong detail response, dùng trực tiếp (ưu tiên)
                        if (detailData?.partner?.id) {
                            const partnerId = detailData.partner.id; // UUID string
                            // Tìm trong partnerMap để lấy tên đầy đủ
                            const partnerInfo = partnerMap.get(partnerId);

                            // Ưu tiên: partnerInfo từ partnerMap > fullName từ detail > email từ detail
                            const ownerName = partnerInfo?.name ||
                                detailData.partner.fullName ||
                                detailData.partner.name ||
                                detailData.partner.email ||
                                `Partner ID: ${partnerId}`;

                            ownerMap.set(hotel.id, {
                                id: partnerId,
                                name: ownerName,
                                email: partnerInfo?.email || detailData.partner.email
                            });
                        } else if (detailData?.partnerId) {
                            // Nếu chỉ có partnerId (không có partner object)
                            const partnerId = detailData.partnerId;
                            const partnerInfo = partnerMap.get(partnerId);

                            if (partnerInfo) {
                                ownerMap.set(hotel.id, {
                                    id: partnerId,
                                    name: partnerInfo.name,
                                    email: partnerInfo.email
                                });
                            } else {
                                // Fallback: tìm trong partners list
                                const partner = partners.find(p => {
                                    const pIdStr = p.id.toString();
                                    return pIdStr === partnerId;
                                });

                                if (partner) {
                                    ownerMap.set(hotel.id, {
                                        id: partnerId,
                                        name: partner.username,
                                        email: partner.email
                                    });
                                } else {
                                    ownerMap.set(hotel.id, {
                                        id: partnerId,
                                        name: `Partner ID: ${partnerId}`,
                                    });
                                }
                            }
                        } else {
                            // Fallback: Dùng getHotelById
                            const hotelDetail = await getHotelById(hotel.id);

                            if (hotelDetail?.ownerId) {
                                // Tìm trong partnerMap với UUID string
                                const partnerInfo = partnerMap.get(hotelDetail.ownerId);

                                if (partnerInfo) {
                                    ownerMap.set(hotel.id, {
                                        id: hotelDetail.ownerId,
                                        name: partnerInfo.name,
                                        email: partnerInfo.email
                                    });
                                } else {
                                    // Fallback: tìm trong partners list (number ID)
                                    const partner = partners.find(p => {
                                        const pIdStr = p.id.toString();
                                        const ownerIdStr = String(hotelDetail.ownerId);
                                        return pIdStr === ownerIdStr;
                                    });

                                    if (partner) {
                                        ownerMap.set(hotel.id, {
                                            id: hotelDetail.ownerId,
                                            name: partner.username,
                                            email: partner.email
                                        });
                                    } else {
                                        ownerMap.set(hotel.id, {
                                            id: hotelDetail.ownerId,
                                            name: `Partner ID: ${hotelDetail.ownerId}`,
                                        });
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        // Ignore error when fetching owner info
                    }
                })
            );

            if (ownerMap.size > 0) {
                setHotelOwnerMap(prev => {
                    const newMap = new Map(prev);
                    ownerMap.forEach((value, key) => newMap.set(key, value));
                    return newMap;
                });
            }
        };

        // Chỉ fetch nếu đã có partners và hotels
        if (partners.length > 0 && hotels.length > 0) {
            fetchOwnerInfo();
        }
    }, [hotels, partners]); // Bỏ partnerMap và hotelOwnerMap khỏi dependency để tránh loop

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

    // Tính STT dựa trên currentPage (1-based)
    const startIndex = (currentPage - 1) * 10;

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
                                CHỦ SỞ HỮU
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
                                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                    Không có khách sạn nào
                                </td>
                            </tr>
                        ) : (
                            hotels.map((hotel, index) => (
                                <tr key={hotel.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{startIndex + index + 1}</div>
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
                                        <div className="text-sm text-gray-900">
                                            {(() => {
                                                // ƯU TIÊN 1: Dùng ownerName từ hotel object (từ list API) - NHANH NHẤT, KHÔNG CẦN FETCH
                                                if (hotel.ownerName) {
                                                    return (
                                                        <div>
                                                            <span className="font-medium block text-gray-900">
                                                                {hotel.ownerName}
                                                            </span>
                                                            {hotel.ownerEmail && (
                                                                <span className="text-xs text-gray-400 block">
                                                                    {hotel.ownerEmail}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                // ƯU TIÊN 2: Dùng ownerInfo từ hotelOwnerMap (đã fetch từ detail API)
                                                const ownerInfo = hotelOwnerMap.get(hotel.id);
                                                if (ownerInfo) {
                                                    return (
                                                        <div>
                                                            <span className="font-medium block text-gray-900">
                                                                {ownerInfo.name}
                                                            </span>
                                                            {ownerInfo.email && (
                                                                <span className="text-xs text-gray-400 block">
                                                                    {ownerInfo.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                // ƯU TIÊN 3: Tìm trong partnerMap với ownerId (UUID string)
                                                const ownerId = hotel.ownerId;
                                                if (ownerId) {
                                                    const partnerInfo = partnerMap.get(ownerId);
                                                    if (partnerInfo) {
                                                        return (
                                                            <div>
                                                                <span className="font-medium block text-gray-900">
                                                                    {partnerInfo.name}
                                                                </span>
                                                                {partnerInfo.email && (
                                                                    <span className="text-xs text-gray-400 block">
                                                                        {partnerInfo.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    // Fallback: Tìm trong partners array (number ID)
                                                    const partner = partners.find(p => {
                                                        const pIdStr = p.id.toString();
                                                        const ownerIdStr = String(ownerId);
                                                        return pIdStr === ownerIdStr;
                                                    });

                                                    if (partner) {
                                                        return (
                                                            <div>
                                                                <span className="font-medium block text-gray-900">
                                                                    {partner.username}
                                                                </span>
                                                                {partner.email && (
                                                                    <span className="text-xs text-gray-400 block">
                                                                        {partner.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                }

                                                // Nếu không tìm thấy, hiển thị "Chưa có thông tin"
                                                return (
                                                    <span className="text-gray-400 italic">
                                                        Chưa có thông tin
                                                    </span>
                                                );
                                            })()}
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
                                            <Link
                                                href={`/super-hotels/${hotel.id}`}
                                                className="p-2 bg-gray-100 text-green-600 hover:bg-gray-200 rounded-md transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

