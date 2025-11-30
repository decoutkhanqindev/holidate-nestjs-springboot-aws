// app/admin-users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getUsers, getCurrentUser } from '@/lib/AdminAPI/userService';
import { createUserAction, updateUserAction, deleteUserAction } from '@/lib/actions/userActions';
import UsersTable from '@/components/Admin/staff_hotels/UsersTable';
import Pagination from '@/components/Admin/pagination/Pagination';
import UserFormModal from '@/components/Admin/staff_hotels/UserFormModal';
import { PlusIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                
                // Load users và currentUser song song, nhưng không fail nếu getCurrentUser lỗi
                const [userData, usersData] = await Promise.allSettled([
                    getCurrentUser(),
                    getUsers({ page: currentPage, limit: ITEMS_PER_PAGE })
                ]);
                
                // Xử lý currentUser
                if (userData.status === 'fulfilled' && userData.value) {
                    setCurrentUser(userData.value);
                } else {
                    // Fallback: tạo một user tạm để page vẫn hoạt động
                    setCurrentUser({
                        id: 0,
                        username: 'Unknown',
                        email: '',
                        avatarUrl: '/avatars/default.png',
                        role: 'HOTEL_ADMIN',
                        status: 'ACTIVE',
                    });
                }
                
                // Xử lý users data
                if (usersData.status === 'fulfilled') {
                    setUsers(usersData.value.data);
                    setTotalPages(usersData.value.totalPages);
                } else {
                    setUsers([]);
                    setTotalPages(0);
                }
            } catch (error) {
                setUsers([]);
                setTotalPages(0);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    // HÀM XỬ LÝ LƯU DỮ LIỆU TỪ FORM
    const handleSave = async (formData: FormData) => {
        try {
            const id = formData.get('id') as string;
            const fullName = formData.get('fullName') as string;

            if (id) {
                // Cập nhật user
                const result = await updateUserAction(id, formData);
                if (result?.error) {
                    toast.error(result.error, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }
                // Lưu roleName vào localStorage nếu có
                const roleName = formData.get('roleName') as string;
                if (roleName) {
                    localStorage.setItem(`user_role_${id}`, roleName);
                }
                
                toast.success('Cập nhật nhân viên thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
                
                // Reload users sau khi update
                const response = await getUsers({ page: currentPage, limit: ITEMS_PER_PAGE });
                setUsers(response.data);
                setTotalPages(response.totalPages);
            } else {
                // Tạo user mới
                const roleName = formData.get('roleName') as string;
                const userEmail = formData.get('email') as string;
                const result = await createUserAction(formData);
                if (result?.error) {
                    toast.error(result.error, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }
                
                // Reload users để lấy userId mới tạo
                const response = await getUsers({ page: currentPage, limit: ITEMS_PER_PAGE });
                // Tìm user mới tạo bằng email
                const newUser = response.data.find(u => u.email === userEmail);
                if (newUser && roleName) {
                    // Lưu roleName vào localStorage với key là userId
                    localStorage.setItem(`user_role_${newUser.id}`, roleName);
                }
                
                toast.success('Tạo nhân viên thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
                
                setUsers(response.data);
                setTotalPages(response.totalPages);
            }

            // Đóng modal
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    // Hàm xử lý xóa user
    const handleDelete = async (userId: number, username: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}" không?`)) {
            return;
        }

        try {
            await deleteUserAction(userId.toString());
            toast.success('Xóa người dùng thành công!', {
                position: "top-right",
                autoClose: 2000,
            });

            // Reload users
            const response = await getUsers({ page: currentPage, limit: ITEMS_PER_PAGE });
            setUsers(response.data);
            setTotalPages(response.totalPages);
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa người dùng. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    if (isLoading) {
        return <p>Đang tải dữ liệu người dùng...</p>;
    }

    // Nếu không có currentUser, vẫn hiển thị page nhưng với warning
    if (!currentUser) {
        return (
            <div>
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    <p>Không thể lấy thông tin người dùng hiện tại. Vui lòng đăng nhập lại.</p>
                </div>
                <UsersTable users={users} currentUser={{
                    id: 0,
                    username: 'Unknown',
                    email: '',
                    avatarUrl: '/avatars/default.png',
                    role: 'HOTEL_ADMIN',
                    status: 'ACTIVE',
                }} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
        );
    }

    return (
        <div>
            <PageHeader title={<span style={{ color: '#2563eb' }}>Quản lý Người dùng</span>}>
                <button
                    onClick={handleAddNew}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm Nhân Viên
                </button>
            </PageHeader>

            <UsersTable users={users} currentUser={currentUser} onEdit={handleEdit} onDelete={handleDelete} />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {/* RENDER MODAL Ở ĐÂY */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={editingUser}
                onSave={handleSave}
            />
        </div>
    );
}