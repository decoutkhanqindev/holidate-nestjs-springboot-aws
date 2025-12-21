// components/Admin/UsersTable.tsx
"use client";

import Image from 'next/image';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { User } from '@/types';



interface UsersTableProps {
    users: User[];
    currentUser: User;
    onEdit: (user: User) => void;
    onDelete?: (id: number, username: string) => void;
}

export default function UsersTable({ users, currentUser, onEdit, onDelete }: UsersTableProps) {
    const handleDelete = (id: number, username: string) => {
        if (onDelete) {
            onDelete(id, username);
        } else {
            // Fallback nếu không có onDelete prop
            if (confirm(`Bạn chắc chắn muốn xóa người dùng "${username}"?`)) {
                alert(`Chức năng xóa chưa được cấu hình.`);
            }
        }
    };

    return (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền</th>
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
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {(() => {
                                            // Ưu tiên lấy roleName từ localStorage (roleName tự do nhập)
                                            if (typeof window !== 'undefined') {
                                                const savedRoleName = localStorage.getItem(`user_role_${user.id}`);
                                                if (savedRoleName) return savedRoleName;
                                            }
                                            // Nếu không có, lấy từ user.role
                                            if (typeof user.role === 'string') return user.role;
                                            if (user.role && typeof user.role === 'object' && 'description' in user.role) {
                                                return (user.role as { description?: string; name?: string }).description ||
                                                    (user.role as { description?: string; name?: string }).name ||
                                                    'Nhân viên';
                                            }
                                            return 'Nhân viên';
                                        })()}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="inline-flex items-center justify-end gap-x-4">
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