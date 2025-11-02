// components/Admin/UsersTable.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { User, UserStatus } from '@/types';

function RoleSelector({ user, currentUser }: { user: User; currentUser: User }) {
    const canChangeRole = currentUser.id !== user.id;
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        alert(`(Giả lập) Đổi quyền của ${user.username} thành ${e.target.value}`);
    };
    return (
        <select
            defaultValue={user.role}
            onChange={handleRoleChange}
            disabled={!canChangeRole}
            className="w-full text-xs p-2 border-transparent rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <option value="HOTEL_STAFF">Nhân viên</option>
            <option value="CUSTOMER">Khách hàng</option>
        </select>
    );
}

function StatusSelector({ user, currentUser }: { user: User; currentUser: User }) {
    const [status, setStatus] = useState<UserStatus>(user.status);
    const canChangeStatus = currentUser.id !== user.id;
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as UserStatus;
        setStatus(newStatus);
        alert(`(Giả lập) Đổi trạng thái của ${user.username} thành ${newStatus}`);
    };
    const statusColorClass = {
        ACTIVE: 'bg-green-100 text-green-800 hover:bg-green-200',
        INACTIVE: 'bg-red-100 text-red-800 hover:bg-red-200',
    };
    return (
        <select
            value={status}
            onChange={handleStatusChange}
            disabled={!canChangeStatus}
            // === THAY ĐỔI Ở ĐÂY: text-sm -> text-xs ===
            className={`w-full text-[11px] leading-[1.2rem] py-[6px] px-2 
rounded-md border border-gray-200 bg-gray-50 
focus:outline-none focus:ring-2 focus:ring-blue-500 
transition disabled:opacity-70 disabled:cursor-not-allowed ${statusColorClass[status]}`}

        >
            <option value="ACTIVE">Kích hoạt</option>
            <option value="INACTIVE">Vô hiệu hóa</option>
        </select>
    );
}


interface UsersTableProps {
    users: User[];
    currentUser: User;
    onEdit: (user: User) => void;
}

export default function UsersTable({ users, currentUser, onEdit }: UsersTableProps) {
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên tài khoản</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <Image
                                                className="h-10 w-10 rounded-full object-cover"
                                                src={user.avatarUrl}
                                                alt={user.username}
                                                width={40}
                                                height={40}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-4 py-4 whitespace-nowrap w-[180px] pl-[16px]">
                                    <RoleSelector user={user} currentUser={currentUser} />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap w-[180px] pl-[16px]">
                                    <StatusSelector user={user} currentUser={currentUser} />
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="inline-flex items-center justify-end gap-x-4">
                                        <button
                                            onClick={() => alert(`(Giả lập) Xem chi tiết người dùng: ${user.username}`)}
                                            className="text-green-600 hover:text-green-700 transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(user)}
                                            disabled={currentUser.id === user.id}
                                            className="text-blue-600 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id, user.username)}
                                            disabled={currentUser.id === user.id}
                                            className="text-red-600 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                            title="Xóa"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}