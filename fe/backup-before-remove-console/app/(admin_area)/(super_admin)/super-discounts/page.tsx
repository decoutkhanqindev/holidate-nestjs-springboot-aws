"use client";

import { useState, useEffect } from "react";
import { getDiscounts } from "@/lib/Super_Admin/discountService";
import { createDiscountAction, updateDiscountAction, deleteDiscountAction } from "@/lib/actions/discountActions";
import DiscountsTable from "@/components/AdminSuper/discounts/DiscountsTable";
import Pagination from "@/components/Admin/pagination/Pagination";
import type { SuperDiscount } from "@/types";
import DiscountFormModal from "@/components/AdminSuper/discounts/DiscountFormModal";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

export default function SuperDiscountsPage() {
    const [discounts, setDiscounts] = useState<SuperDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<SuperDiscount | null>(null);

    const loadDiscounts = async () => {
        setIsLoading(true);
        try {
            const response = await getDiscounts({ 
                page: currentPage, 
                size: ITEMS_PER_PAGE,
                sortBy: 'createdAt',
                sortDir: 'desc'
            });
            setDiscounts(response.content);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error: any) {
            console.error('[SuperDiscountsPage] Error loading discounts:', error);
            toast.error(error.message || 'Không thể tải danh sách mã giảm giá', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDiscounts();
    }, [currentPage]);

    // Auto-refresh data mỗi 30 giây để cập nhật timesUsed và active status
    useEffect(() => {
        const interval = setInterval(() => {
            loadDiscounts();
        }, 30000); // 30 giây

        return () => clearInterval(interval);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        // Pagination component truyền vào page bắt đầu từ 1, nhưng backend dùng 0-based
        setCurrentPage(page - 1);
    };

    const handleAddNew = () => {
        setEditingDiscount(null);
        setIsModalOpen(true);
    };

    const handleEdit = (discount: SuperDiscount) => {
        setEditingDiscount(discount);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Bạn có chắc muốn xóa mã giảm giá "${code}"?`)) {
            return;
        }

        try {
            await deleteDiscountAction(id);
            toast.success('Xóa mã giảm giá thành công!', {
                position: "top-right",
                autoClose: 2000,
            });

            // Reload data
            const response = await getDiscounts({ 
                page: currentPage, 
                size: ITEMS_PER_PAGE,
                sortBy: 'createdAt',
                sortDir: 'desc'
            });
            setDiscounts(response.content);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error: any) {
            console.error('[SuperDiscountsPage] Error deleting discount:', error);
            toast.error(error.message || 'Không thể xóa mã giảm giá. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleSave = async (formData: FormData) => {
        try {
            const id = formData.get('id') as string;

            if (id) {
                // Cập nhật
                const result = await updateDiscountAction(formData);
                if (result?.error) {
                    toast.error(result.error, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }
                toast.success('Cập nhật mã giảm giá thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
            } else {
                // Tạo mới
                const result = await createDiscountAction(formData);
                if (result?.error) {
                    toast.error(result.error, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }
                toast.success('Tạo mã giảm giá thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
            }

            // Đóng modal và refresh data
            setIsModalOpen(false);
            
            // Reload data
            const response = await getDiscounts({ 
                page: currentPage, 
                size: ITEMS_PER_PAGE,
                sortBy: 'createdAt',
                sortDir: 'desc'
            });
            setDiscounts(response.content);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error: any) {
            console.error('[SuperDiscountsPage] Error saving discount:', error);
            toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 text-dark mb-0">Quản lý Mã giảm giá</h1>
                    {!isLoading && (
                        <p className="text-muted small mb-0 mt-1">
                            Tổng cộng: {totalItems} mã giảm giá
                        </p>
                    )}
                </div>
                <button className="btn btn-primary" onClick={handleAddNew}>
                    + Thêm Mã giảm giá
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải danh sách mã giảm giá...</p>
                </div>
            ) : (
                <>
                    <DiscountsTable
                        discounts={discounts}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    {totalPages > 1 && (
                        <div className="mt-4 d-flex justify-content-center">
                            <Pagination
                                currentPage={currentPage + 1} // Convert từ 0-based sang 1-based
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}

            <DiscountFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                discount={editingDiscount}
            />
        </div>
    );
}

