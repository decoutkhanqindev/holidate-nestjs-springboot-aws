// app/admin-users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getUsers, getCurrentUser } from '@/lib/AdminAPI/userService'; // Import service
import UsersTable from '@/components/Admin/staff_hotels/UsersTable';
import Pagination from '@/components/Admin/pagination/Pagination';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { User } from '@/types';

function PageHeader({ title, children }: { title: React.ReactNode, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        // Trong ứng dụng thật, bạn sẽ lấy currentUser từ useAuth()
        const user = getCurrentUser();
        setCurrentUser(user);

        async function loadUsers() {
            setIsLoading(true);
            const response = await getUsers({ page: currentPage, limit: ITEMS_PER_PAGE });
            setUsers(response.data);
            setTotalPages(response.totalPages);
            setIsLoading(false);
        }
        loadUsers();
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (isLoading || !currentUser) {
        return <p>Đang tải dữ liệu người dùng...</p>;
    }

    return (
        <div>
            <PageHeader title={<span style={{ color: '#2563eb' }}>Quản lý Người dùng</span>}>
                <button
                    // onClick={handleAddNew} // Sẽ thêm logic modal sau
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm Người Dùng
                </button>
            </PageHeader>

            <UsersTable users={users} currentUser={currentUser} />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}