"use client";

import { useState, useEffect } from "react";
import { getHotelAdmins } from "@/lib/Super_Admin/hotelAdminService";
import HotelAdminsTable from "@/components/AdminSuper/ManageAdmin/HotelAdminsTable";
import Pagination from "@/components/Admin/pagination/Pagination";
import type { HotelAdmin } from "@/types";
import HotelAdminFormModal from "@/components/AdminSuper/ManageAdmin/HotelAdminFormModal";

const ITEMS_PER_PAGE = 5;

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

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa tài khoản admin "${name}"?`)) {
            alert(`(Giả lập) Đã xóa admin ID: ${id}`);
        }
    };

    const handleSave = (formData: FormData) => {
        const username = formData.get('username');
        if (editingAdmin) {
            alert(`(Giả lập) Đã cập nhật admin: ${username}`);
        } else {
            alert(`(Giả lập) Đã thêm mới admin: ${username}`);
        }
        setIsModalOpen(false);
        // Cân nhắc tải lại dữ liệu ở đây
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