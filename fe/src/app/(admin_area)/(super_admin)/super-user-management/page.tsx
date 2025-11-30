"use client";

import { useState, useEffect } from "react";
import { getHotelAdmins } from "@/lib/Super_Admin/hotelAdminService";
import { createHotelAdminAction, deleteHotelAdminAction } from "@/lib/actions/hotelAdminActions";
import HotelAdminsTable from "@/components/AdminSuper/ManageAdmin/HotelAdminsTable";
import Pagination from "@/components/Admin/pagination/Pagination";
import type { HotelAdmin } from "@/types";
import HotelAdminFormModal from "@/components/AdminSuper/ManageAdmin/HotelAdminFormModal";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

export default function SuperAdminsPage() {
    const [admins, setAdmins] = useState<HotelAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<HotelAdmin | null>(null);

    useEffect(() => {
        const loadAdmins = async () => {
            setIsLoading(true);
            const response = await getHotelAdmins({ page: currentPage, limit: ITEMS_PER_PAGE });
            setAdmins(response.data);
            setTotalPages(response.totalPages);
            setIsLoading(false);
        };
        loadAdmins();
    }, [currentPage]);

    const handlePageChange = (page: number) => setCurrentPage(page);

    const handleAddNew = () => {
        setEditingAdmin(null);
        setIsModalOpen(true);
    };

    const handleEdit = (admin: HotelAdmin) => {
        setEditingAdmin(admin);
        setIsModalOpen(true);
    };

    const handleDelete = async (admin: HotelAdmin) => {
        if (!confirm(`Bạn có chắc muốn xóa tài khoản admin "${admin.username}"?`)) {
            return;
        }

        try {
            // Sử dụng userId (UUID string) thay vì id (number) để gọi API
            await deleteHotelAdminAction(admin.userId);
            toast.success('Xóa admin khách sạn thành công!', {
                position: "top-right",
                autoClose: 2000,
            });

            // Reload data
            const response = await getHotelAdmins({ page: currentPage, limit: ITEMS_PER_PAGE });
            setAdmins(response.data);
            setTotalPages(response.totalPages);
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa admin khách sạn. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleSave = async (formData: FormData) => {
        try {
            const id = formData.get('id') as string;
            const fullName = formData.get('fullName') as string;

            if (id) {
                // Cập nhật - Hiện tại backend không hỗ trợ update user trực tiếp
                // Có thể cần implement updateUserAction tương tự như user management
                toast.info('Chức năng cập nhật đang được phát triển', {
                    position: "top-right",
                    autoClose: 2000,
                });
                setIsModalOpen(false);
                return;
            } else {
                // Tạo mới
                const result = await createHotelAdminAction(formData);
                if (result?.error) {
                    toast.error(result.error, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }
                toast.success('Tạo admin khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
            }

            // Đóng modal và refresh data
            setIsModalOpen(false);

            // Reload data
            const response = await getHotelAdmins({ page: currentPage, limit: ITEMS_PER_PAGE });
            setAdmins(response.data);
            setTotalPages(response.totalPages);
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 text-dark mb-0">Quản lý Admin Khách sạn</h1>
                <button className="btn btn-primary" onClick={handleAddNew}>
                    + Thêm Admin
                </button>
            </div>

            {isLoading ? (
                <p>Đang tải danh sách admin...</p>
            ) : (
                <>
                    <HotelAdminsTable
                        admins={admins}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    <div className="mt-4 d-flex justify-content-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            )}


            <HotelAdminFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                admin={editingAdmin}
            />

        </div>
    );
}