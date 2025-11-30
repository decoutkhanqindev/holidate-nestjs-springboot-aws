"use client";

import { useState, useEffect } from "react";
import { getHotels } from "@/lib/AdminAPI/hotelService";
import { getHotelAdmins } from "@/lib/Super_Admin/hotelAdminService";
import SuperHotelsTable from "@/components/AdminSuper/hotels/SuperHotelsTable";
import Pagination from "@/components/Admin/pagination/Pagination";
import SuperHotelFormModal from "@/components/AdminSuper/hotels/SuperHotelFormModal";
import type { Hotel } from "@/types";
import { toast } from "react-toastify";
import { PlusIcon } from "@heroicons/react/24/solid";

const ITEMS_PER_PAGE = 10;

// Component PageHeader
function PageHeader({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

export default function SuperHotelsPage() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadHotels = async () => {
            setIsLoading(true);
            try {
                // Nếu có selectedPartnerId, filter theo partner
                // selectedPartnerId giờ đã là UUID string từ dropdown
                const partnerIdToFilter = selectedPartnerId && selectedPartnerId.trim() !== '' 
                    ? selectedPartnerId.trim() 
                    : undefined;
                
                console.log('[SuperHotelsPage] Loading hotels with partner filter:', partnerIdToFilter);
                
                const response = await getHotels(
                    currentPage, 
                    ITEMS_PER_PAGE,
                    undefined, // cityId
                    undefined, // provinceId
                    partnerIdToFilter, // userId/partnerId - CẦN LÀ UUID STRING
                    'admin' // roleName
                );
                setHotels(response.hotels);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
                
                console.log(`[SuperHotelsPage] Loaded ${response.hotels.length} hotels (filter by partner: ${partnerIdToFilter || 'none'})`);
            } catch (error: any) {
                console.error("[SuperHotelsPage] Error loading hotels:", error);
                toast.error(error.message || "Không thể tải danh sách khách sạn", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadHotels();
    }, [currentPage, selectedPartnerId]);

    const handlePageChange = (page: number) => {
        // Pagination component trả về page 1-based, cần convert sang 0-based
        setCurrentPage(page - 1);
    };

    const handleCreateSuccess = () => {
        setIsModalOpen(false);
        // Reload data
        const loadHotels = async () => {
            try {
                const response = await getHotels(
                    currentPage, 
                    ITEMS_PER_PAGE,
                    undefined,
                    undefined,
                    selectedPartnerId || undefined,
                    'admin'
                );
                setHotels(response.hotels);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
            } catch (error: any) {
                console.error("[SuperHotelsPage] Error reloading hotels:", error);
            }
        };
        loadHotels();
    };

    return (
        <div className="p-6 md:p-8">
            <PageHeader title={<span style={{ color: '#2563eb', fontWeight: 700 }}>Quản lý Khách sạn (Hệ thống)</span>}>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm khách sạn
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Đang tải danh sách khách sạn...</div>
                </div>
            ) : (
                <>
                    <SuperHotelsTable
                        hotels={hotels}
                        currentPage={currentPage + 1} // Convert sang 1-based cho display
                        totalPages={totalPages}
                        totalItems={totalItems}
                        selectedPartnerId={selectedPartnerId}
                        onPartnerChange={setSelectedPartnerId}
                    />
                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                currentPage={currentPage + 1}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Modal tạo khách sạn mới */}
            <SuperHotelFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}

