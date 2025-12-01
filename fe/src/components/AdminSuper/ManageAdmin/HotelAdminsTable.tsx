// components/Admin/HotelAdminsTable.tsx
"use client";

import type { HotelAdmin } from '@/types';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

// Component con cho Status Badge
function StatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' }) {
    const isActive = status === 'ACTIVE';
    return (
        <span className={`badge ${isActive ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'}`}>
            {isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
        </span>
    );
}

interface HotelAdminsTableProps {
    admins: HotelAdmin[];
    onEdit: (admin: HotelAdmin) => void;
    onDelete: (admin: HotelAdmin) => void;
    onStatusChange?: (admin: HotelAdmin, newStatus: 'ACTIVE' | 'INACTIVE') => void;
    currentPage?: number;
}

export default function HotelAdminsTable({ admins, onEdit, onDelete, currentPage = 1 }: HotelAdminsTableProps) {
    const ITEMS_PER_PAGE = 10;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return (
        <div className="card shadow-sm">
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th scope="col" className="p-3">STT</th>
                                <th scope="col" className="p-3">ID</th>
                                <th scope="col" className="p-3">Tên tài khoản</th>
                                <th scope="col" className="p-3">Email</th>
                                <th scope="col" className="p-3">Trạng thái</th>
                                <th scope="col" className="p-3 text-end">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-3 text-center text-muted">
                                        Không có đối tác nào
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin, index) => (
                                    <tr key={admin.userId}>
                                        <td className="p-3">{startIndex + index + 1}</td>
                                        <td className="p-3">
                                            <code className="text-primary small" style={{ fontSize: '0.85rem' }}>
                                                {admin.userId}
                                            </code>
                                        </td>
                                        <td className="p-3 fw-medium text-dark">{admin.username}</td>
                                        <td className="p-3">{admin.email}</td>
                                        <td className="p-3">
                                            <StatusBadge status={admin.status} />
                                        </td>
                                        <td className="p-3 text-end">
                                            <button onClick={() => onEdit(admin)} className="btn btn-sm btn-outline-primary me-2" title="Chỉnh sửa">
                                                <FaPencilAlt />
                                            </button>
                                            <button onClick={() => onDelete(admin)} className="btn btn-sm btn-outline-danger" title="Xóa">
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
    );
}