// components/Admin/UsersTable.tsx
"use client";

import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { User, UserRole, UserStatus } from '@/types';

// Component con cho dropdown chọn Quyền
function RoleSelector({ user, currentUser }: { user: User; currentUser: User }) {
    // Logic phân quyền: không cho sửa quyền của chính mình hoặc người có quyền cao hơn/bằng
    const canChangeRole = currentUser.id !== user.id && currentUser.role > user.role;

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        alert(`(Giả lập) Đổi quyền của ${user.username} thành ${e.target.value}`);
    };

    return (
        <select
            defaultValue={user.role}
            onChange={handleRoleChange}
            disabled={!canChangeRole}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
            {/* HOTEL_ADMIN chỉ có thể cấp các quyền này */}
            <option value="HOTEL_STAFF">Nhân viên</option>
            <option value="CUSTOMER">Khách hàng</option>
        </select>
    );
}

// Component con cho dropdown chọn Trạng thái
function StatusSelector({ user, currentUser }: { user: User; currentUser: User }) {
    const canChangeStatus = currentUser.id !== user.id && currentUser.role > user.role;

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        alert(`(Giả lập) Đổi trạng thái của ${user.username} thành ${e.target.value}`);
    };

    return (
        <select
            defaultValue={user.status}
            onChange={handleStatusChange}
            disabled={!canChangeStatus}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
            <option value="ACTIVE">Kích hoạt</option>
            <option value="INACTIVE">Vô hiệu hóa</option>
        </select>
    );
}

interface UsersTableProps {
    users: User[];
    currentUser: User;
}

export default function UsersTable({ users, currentUser }: UsersTableProps) {
    const handleDelete = (id: number, username: string) => {
        if (confirm(`Bạn chắc chắn muốn xóa người dùng "${username}"?`)) {
            alert(`(Giả lập) Đã xóa người dùng ID: ${id}`);
        }
    };

    return (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">ID</th>
                            <th className="px-6 py-3 text-left">Ảnh</th>
                            <th className="px-6 py-3 text-left">Tên tài khoản</th>
                            <th className="px-6 py-3 text-left">Email</th>
                            <th className="px-6 py-3 text-left">Quyền</th>
                            <th className="px-6 py-3 text-left">Trạng Thái</th>
                            <th className="px-6 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user, index) => (
                            <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4">{user.id}</td>
                                <td className="px-6 py-4">
                                    <Image src={user.avatarUrl} alt={user.username} width={40} height={40} className="rounded-full" />
                                </td>
                                <td className="px-6 py-4 font-medium">{user.username}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4 w-48"><RoleSelector user={user} currentUser={currentUser} /></td>
                                <td className="px-6 py-4 w-48"><StatusSelector user={user} currentUser={currentUser} /></td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(user.id, user.username)}
                                        disabled={currentUser.id === user.id || currentUser.role <= user.role}
                                        className="text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}