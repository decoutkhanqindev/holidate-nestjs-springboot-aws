"use client";

import { useState, useEffect } from "react";
import { getHotelAdmins } from "@/lib/Super_Admin/hotelAdminService";
import { createHotelAdminAction, deleteHotelAdminAction } from "@/lib/actions/hotelAdminActions";
import { updateUser } from "@/lib/AdminAPI/userService";
import HotelAdminsTable from "@/components/AdminSuper/ManageAdmin/HotelAdminsTable";
import Pagination from "@/components/Admin/pagination/Pagination";
import type { HotelAdmin } from "@/types";
import HotelAdminFormModal from "@/components/AdminSuper/ManageAdmin/HotelAdminFormModal";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import LoadingSpinner from "@/components/AdminSuper/common/LoadingSpinner";

const ITEMS_PER_PAGE = 10;

export default function SuperAdminsPage() {
    const [admins, setAdmins] = useState<HotelAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<'email' | 'full-name' | 'created-at' | 'updated-at'>('created-at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<HotelAdmin | null>(null);

    useEffect(() => {
        const loadAdmins = async () => {
            setIsLoading(true);
            try {
                const response = await getHotelAdmins({
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    searchQuery: searchQuery.trim(),
                    sortBy,
                    sortDir
                });
                setAdmins(response.data);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
            } catch (error: any) {
                toast.error(error.message || 'Không thể tải danh sách đối tác', {
                    position: "top-right",
                    autoClose: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadAdmins();
    }, [currentPage, searchQuery, sortBy, sortDir]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset về trang đầu khi search
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setCurrentPage(1);
    };

    const handleAddNew = () => {
        setEditingAdmin(null);
        setIsModalOpen(true);
    };

    const handleEdit = (admin: HotelAdmin) => {
        setEditingAdmin(admin);
        setIsModalOpen(true);
    };

    const handleDelete = async (admin: HotelAdmin) => {
        if (!confirm(`Bạn có chắc muốn xóa tài khoản đối tác "${admin.username}"?`)) {
            return;
        }

        try {
            // Sử dụng userId (UUID string) thay vì id (number) để gọi API
            await deleteHotelAdminAction(admin.userId);
            toast.success('Xóa đối tác khách sạn thành công!', {
                position: "top-right",
                autoClose: 2000,
            });

            // Reload data
            const response = await getHotelAdmins({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchQuery: searchQuery.trim(),
                sortBy,
                sortDir
            });
            setAdmins(response.data);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa đối tác khách sạn. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleSave = async (formData: FormData) => {
        try {
            const userId = formData.get('userId') as string;

            if (userId) {
                // Cập nhật - chỉ gọi API cho user đó
                const fullName = formData.get('fullName') as string;
                const active = formData.get('active') as string;

                if (!fullName || !fullName.trim()) {
                    toast.error('Họ và tên là bắt buộc.', {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }

                // Gọi API update user trực tiếp từ client
                const updatedUserResponse = await updateUser(userId, {
                    fullName: fullName.trim(),
                    active: active === 'true' || active === '1'
                });

                // Map response sang HotelAdmin và cập nhật state local
                const updatedAdmin: HotelAdmin = {
                    id: parseInt(updatedUserResponse.id) || 0,
                    userId: updatedUserResponse.id,
                    username: updatedUserResponse.fullName,
                    email: updatedUserResponse.email,
                    managedHotel: {
                        id: '',
                        name: '',
                    },
                    status: (updatedUserResponse.authInfo?.active !== undefined
                        ? updatedUserResponse.authInfo.active
                        : (updatedUserResponse.active !== undefined ? updatedUserResponse.active : true))
                        ? 'ACTIVE' : 'INACTIVE',
                    createdAt: updatedUserResponse.createdAt ? new Date(updatedUserResponse.createdAt) : new Date(),
                };

                // Cập nhật state local - chỉ update item được edit
                setAdmins(prevAdmins =>
                    prevAdmins.map(admin =>
                        admin.userId === userId ? updatedAdmin : admin
                    )
                );

                toast.success('Cập nhật đối tác khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
            } else {
                // Tạo mới - cần reload để thêm vào danh sách
                const result = await createHotelAdminAction(formData);
                if (result?.error) {
                    toast.error(result.error, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }
                toast.success('Tạo đối tác khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });

                // Reload data để hiển thị user mới
                const response = await getHotelAdmins({
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    searchQuery: searchQuery.trim(),
                    sortBy,
                    sortDir
                });
                setAdmins(response.data);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
            }

            // Đóng modal
            setIsModalOpen(false);
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
                <div>
                    <h1 className="h3 text-dark mb-0">Quản lý Đối tác Khách sạn</h1>
                    {!isLoading && (
                        <p className="text-muted small mb-0 mt-1">
                            Tổng số đối tác: <span className="fw-semibold text-primary">{totalItems}</span>
                            {searchQuery && (
                                <span className="ms-2">
                                    (Kết quả tìm kiếm: <span className="fw-semibold text-info">{admins.length}</span>)
                                </span>
                            )}
                        </p>
                    )}
                </div>
                <button className="btn btn-primary" onClick={handleAddNew}>
                    + Thêm Đối tác
                </button>
            </div>

            {/* Search and Filter */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <form onSubmit={handleSearch}>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-6">
                                <label htmlFor="search" className="form-label fw-semibold">
                                    <FaSearch className="me-1" />
                                    Tìm kiếm
                                </label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="search"
                                        placeholder="Tìm theo tên, email hoặc ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handleClearSearch}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="sortBy" className="form-label fw-semibold">
                                    Sắp xếp theo
                                </label>
                                <select
                                    className="form-select"
                                    id="sortBy"
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value as any);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="created-at">Ngày tạo</option>
                                    <option value="full-name">Tên</option>
                                    <option value="email">Email</option>
                                    <option value="updated-at">Ngày cập nhật</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="sortDir" className="form-label fw-semibold">
                                    Thứ tự
                                </label>
                                <select
                                    className="form-select"
                                    id="sortDir"
                                    value={sortDir}
                                    onChange={(e) => {
                                        setSortDir(e.target.value as 'asc' | 'desc');
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="desc">Giảm dần</option>
                                    <option value="asc">Tăng dần</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner message="Đang tải danh sách đối tác..." />
            ) : (
                <>
                    <HotelAdminsTable
                        admins={admins}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        currentPage={currentPage}
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