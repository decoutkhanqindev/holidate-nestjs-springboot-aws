"use client";

import { useState, useEffect } from "react";
import { getCustomerUsers } from "@/lib/Super_Admin/userService";
import Pagination from "@/components/Admin/pagination/Pagination";
import type { CustomerUser } from "@/lib/Super_Admin/userService";
import { toast } from "react-toastify";
import { deleteUserAction } from "@/lib/actions/userActions";
import { FaTrash } from "react-icons/fa";
import LoadingSpinner from "@/components/AdminSuper/common/LoadingSpinner";

const ITEMS_PER_PAGE = 10;

export default function SuperUsersPage() {
    const [users, setUsers] = useState<CustomerUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true);
            try {
                const response = await getCustomerUsers({ page: currentPage, limit: ITEMS_PER_PAGE });
                setUsers(response.data);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
            } catch (error: any) {
                toast.error(error.message || "Không thể tải danh sách người dùng", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadUsers();
    }, [currentPage]);

    const handlePageChange = (page: number) => setCurrentPage(page);

    const handleDelete = async (user: CustomerUser) => {
        if (!confirm(`Bạn có chắc muốn xóa người dùng "${user.fullName}" (${user.email})?`)) {
            return;
        }

        try {
            await deleteUserAction(user.userId);
            toast.success('Xóa người dùng thành công!', {
                position: "top-right",
                autoClose: 2000,
            });

            // Reload data
            const response = await getCustomerUsers({ page: currentPage, limit: ITEMS_PER_PAGE });
            setUsers(response.data);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa người dùng. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const formatDate = (date: Date | undefined) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'N/A';
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 text-dark mb-0">Quản lý Người dùng</h1>
                    {!isLoading && (
                        <p className="text-muted small mb-0 mt-1">
                            Tổng số người dùng: <span className="fw-semibold text-primary">{totalItems}</span>
                        </p>
                    )}
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner message="Đang tải danh sách người dùng..." />
            ) : (
                <>
                    <div className="card shadow-sm">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col" className="p-3">STT</th>
                                            <th scope="col" className="p-3">Tên</th>
                                            <th scope="col" className="p-3">Số điện thoại</th>
                                            <th scope="col" className="p-3">Email</th>
                                            <th scope="col" className="p-3">Địa chỉ</th>
                                            <th scope="col" className="p-3">Trạng thái</th>
                                            <th scope="col" className="p-3">Ngày tạo</th>
                                            <th scope="col" className="p-3 text-end">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center p-4 text-muted">
                                                    Không có người dùng nào
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((user, index) => (
                                                <tr key={user.id}>
                                                    <td className="p-3">
                                                        <span className="text-muted">
                                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="d-flex align-items-center">
                                                            {user.avatarUrl ? (
                                                                <img
                                                                    src={user.avatarUrl}
                                                                    alt={user.fullName}
                                                                    className="rounded-circle me-2"
                                                                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="rounded-circle me-2 d-flex align-items-center justify-content-center text-white fw-bold"
                                                                    style={{
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        backgroundColor: '#6c757d',
                                                                        fontSize: '0.875rem'
                                                                    }}
                                                                >
                                                                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                                </div>
                                                            )}
                                                            <span className="fw-medium text-dark">{user.fullName || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span>{user.phoneNumber || 'N/A'}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="text-primary">{user.email}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="text-muted small">
                                                            {user.address || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`badge ${user.status === 'ACTIVE' ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'}`}
                                                        >
                                                            {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="text-muted small">
                                                            {formatDate(user.createdAt)}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-end">
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Xóa người dùng"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 d-flex justify-content-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

