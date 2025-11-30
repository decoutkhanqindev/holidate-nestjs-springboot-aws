// app/admin-discounts/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getDiscounts } from '@/lib/AdminAPI/discountService';
import DiscountsTable from '@/components/Admin/discount/DiscountsTable';
import DiscountFormModal from '@/components/Admin/discount/DiscountFormModal';
import Pagination from '@/components/Admin/pagination/Pagination';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { Discount } from '@/types';

function PageHeader({ title, children }: { title: React.ReactNode, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md-items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md-mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

const ITEMS_PER_PAGE = 10;

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

    // --- BẮT ĐẦU THAY ĐỔI CHO PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Hàm lấy dữ liệu sẽ phụ thuộc vào trang hiện tại
    useEffect(() => {
        async function loadDiscounts() {
            setIsLoading(true);
            try {
                // Backend dùng 0-based index, frontend dùng 1-based
                const response = await getDiscounts({
                    page: currentPage - 1, // Convert 1-based to 0-based
                    size: ITEMS_PER_PAGE
                });
                setDiscounts(response.data);
                setTotalPages(response.totalPages);
            } catch (error: any) {
                // Hiển thị lỗi cho user (có thể thêm toast notification)
                alert('Không thể tải danh sách mã giảm giá: ' + (error.message || 'Lỗi không xác định'));
                setDiscounts([]);
                setTotalPages(0);
            } finally {
                setIsLoading(false);
            }
        }
        loadDiscounts();
    }, [currentPage]);
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (discount: Discount) => {
        setEditingDiscount(discount);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingDiscount(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDiscount(null);
    };

    return (
        <div>
            <PageHeader title={<span style={{ color: '#2563eb' }}>Quản lý Mã giảm giá</span>}>
                <button
                    onClick={handleAddNew}
                    className="inline-flex  gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm mã giảm giá
                </button>
            </PageHeader>

            {isLoading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <>
                    <DiscountsTable discounts={discounts} onEdit={handleEdit} />
                    {/* THÊM COMPONENT PHÂN TRANG VÀO ĐÂY */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}

            <DiscountFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                discount={editingDiscount}
            />
        </div>
    );
}