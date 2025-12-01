// app/admin-users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getCurrentUser, getUserById } from '@/lib/AdminAPI/userService';
import { getBookings } from '@/lib/AdminAPI/bookingService';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import UsersTable from '@/components/Admin/staff_hotels/UsersTable';
import Pagination from '@/components/Admin/pagination/Pagination';
import UserFormModal from '@/components/Admin/staff_hotels/UserFormModal';
import { PlusIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/Admin/common/LoadingSpinner';
import type { User } from '@/types';
import apiClient, { ApiResponse } from '@/service/apiClient';

function PageHeader({ title, children }: { title: React.ReactNode, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

const ITEMS_PER_PAGE = 10;

interface UserWithDetails extends User {
    fullName?: string;
    phoneNumber?: string;
    createdAt?: Date;
}

export default function UsersPage() {
    const { effectiveUser } = useAuth();
    const [users, setUsers] = useState<UserWithDetails[]>([]);
    const [allUsers, setAllUsers] = useState<UserWithDetails[]>([]); // Tất cả users (trước khi filter/search)
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // Search and Sort
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt'); // 'fullName', 'email', 'createdAt'
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Load users từ bookings
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                
                // Load currentUser
                const userData = await getCurrentUser();
                if (userData) {
                    setCurrentUser(userData);
                } else {
                    setCurrentUser({
                        id: 0,
                        username: 'Unknown',
                        email: '',
                        avatarUrl: '/avatars/default.png',
                        role: 'HOTEL_ADMIN',
                        status: 'ACTIVE',
                    });
                }

                // Lấy users từ bookings
                const roleName = effectiveUser?.role?.name;
                const userId = effectiveUser?.id;
                const uniqueUserIds = new Set<string>();

                if (roleName?.toLowerCase() === 'partner' && userId) {
                    // PARTNER: Lấy bookings của TẤT CẢ hotels họ sở hữu
                    const allHotelIds: string[] = [];
                    let hotelPage = 0;
                    const hotelPageSize = 50;
                    let hasMoreHotels = true;

                    while (hasMoreHotels) {
                        try {
                            const hotelsData = await getHotels(
                                hotelPage,
                                hotelPageSize,
                                undefined,
                                undefined,
                                userId,
                                'PARTNER'
                            );
                            
                            const pageHotelIds = hotelsData.hotels.map(h => h.id);
                            allHotelIds.push(...pageHotelIds);
                            
                            hasMoreHotels = hotelsData.hasNext || false;
                            hotelPage++;
                        } catch (err: any) {
                            console.error(`Error fetching hotels page ${hotelPage}:`, err);
                            hasMoreHotels = false;
                        }
                    }

                    // Lấy bookings của TẤT CẢ hotels
                    for (const hotelId of allHotelIds) {
                        try {
                            let bookingPage = 0;
                            const bookingPageSize = 50;
                            let hasMoreBookings = true;

                            while (hasMoreBookings) {
                                // Gọi API trực tiếp để lấy BookingResponse với user info
                                const response = await apiClient.get<ApiResponse<{
                                    content: Array<{
                                        id: string;
                                        user: {
                                            id: string;
                                            email: string;
                                            fullName: string;
                                        };
                                    }>;
                                    hasNext: boolean;
                                }>>('/bookings', {
                                    params: {
                                        page: bookingPage,
                                        size: bookingPageSize,
                                        'sort-by': 'created-at',
                                        'sort-dir': 'desc',
                                        'hotel-id': hotelId,
                                    },
                                });

                                if (response.data?.statusCode === 200 && response.data.data) {
                                    response.data.data.content.forEach((booking: any) => {
                                        if (booking.user?.id) {
                                            uniqueUserIds.add(booking.user.id);
                                        }
                                    });
                                    
                                    hasMoreBookings = response.data.data.hasNext || false;
                                    bookingPage++;
                                } else {
                                    hasMoreBookings = false;
                                }
                            }
                        } catch (err: any) {
                            console.error(`Error fetching bookings for hotel ${hotelId}:`, err);
                        }
                    }
                } else {
                    // ADMIN: Lấy tất cả bookings
                    let bookingPage = 0;
                    const bookingPageSize = 50;
                    let hasMoreBookings = true;

                    while (hasMoreBookings) {
                        try {
                            const response = await apiClient.get<ApiResponse<{
                                content: Array<{
                                    id: string;
                                    user: {
                                        id: string;
                                        email: string;
                                        fullName: string;
                                    };
                                }>;
                                hasNext: boolean;
                            }>>('/bookings', {
                                params: {
                                    page: bookingPage,
                                    size: bookingPageSize,
                                    'sort-by': 'created-at',
                                    'sort-dir': 'desc',
                                },
                            });

                            if (response.data?.statusCode === 200 && response.data.data) {
                                response.data.data.content.forEach((booking: any) => {
                                    if (booking.user?.id) {
                                        uniqueUserIds.add(booking.user.id);
                                    }
                                });
                                
                                hasMoreBookings = response.data.data.hasNext || false;
                                bookingPage++;
                            } else {
                                hasMoreBookings = false;
                            }
                        } catch (err: any) {
                            console.error(`Error fetching bookings page ${bookingPage}:`, err);
                            hasMoreBookings = false;
                        }
                    }
                }

                // Lấy thông tin user từ các IDs
                const usersList: UserWithDetails[] = [];
                for (const userId of Array.from(uniqueUserIds)) {
                    try {
                        const response = await apiClient.get<ApiResponse<{
                            id: string;
                            email: string;
                            fullName: string;
                            phoneNumber?: string;
                            avatarUrl?: string;
                            role: {
                                id: string;
                                name: string;
                            };
                            createdAt?: string;
                        }>>(`/users/${userId}`);

                        if (response.data?.statusCode === 200 && response.data.data) {
                            const userData = response.data.data;
                            const roleMap: Record<string, User['role']> = {
                                'SUPER_ADMIN': 'SUPER_ADMIN',
                                'HOTEL_ADMIN': 'HOTEL_ADMIN',
                                'HOTEL_STAFF': 'HOTEL_STAFF',
                                'CUSTOMER': 'CUSTOMER',
                                'USER': 'CUSTOMER',
                            };

                            usersList.push({
                                id: parseInt(userData.id) || 0,
                                username: userData.fullName,
                                email: userData.email,
                                avatarUrl: userData.avatarUrl || '/avatars/default.png',
                                role: roleMap[userData.role.name] || 'CUSTOMER',
                                status: 'ACTIVE',
                                fullName: userData.fullName,
                                phoneNumber: userData.phoneNumber,
                                createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined,
                            });
                        }
                    } catch (err: any) {
                        console.error(`Error fetching user ${userId}:`, err);
                    }
                }

                setAllUsers(usersList);
            } catch (error: any) {
                console.error('Error loading users:', error);
                setAllUsers([]);
                toast.error('Không thể tải danh sách người dùng: ' + (error.message || 'Lỗi không xác định'));
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [effectiveUser?.id, effectiveUser?.role?.name]);

    // Filter và sort users
    useEffect(() => {
        let filtered = [...allUsers];

        // Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user => 
                (user.fullName || user.username || '').toLowerCase().includes(query) ||
                (user.email || '').toLowerCase().includes(query) ||
                (user.phoneNumber || '').toLowerCase().includes(query)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortBy === 'fullName') {
                aValue = (a.fullName || a.username || '').toLowerCase();
                bValue = (b.fullName || b.username || '').toLowerCase();
            } else if (sortBy === 'email') {
                aValue = (a.email || '').toLowerCase();
                bValue = (b.email || '').toLowerCase();
            } else if (sortBy === 'createdAt') {
                aValue = a.createdAt?.getTime() || 0;
                bValue = b.createdAt?.getTime() || 0;
            } else {
                aValue = (a.fullName || a.username || '').toLowerCase();
                bValue = (b.fullName || b.username || '').toLowerCase();
            }

            if (sortDir === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        // Paginate
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedData = filtered.slice(start, end);

        setUsers(paginatedData);
        setTotalPages(totalPages);
        setTotalItems(totalItems);
    }, [allUsers, searchQuery, sortBy, sortDir, currentPage]);

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
                
                // Reload users sau khi update - reload từ bookings
                // Trigger reload bằng cách thay đổi một dependency
                window.location.reload();
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
                
                toast.success('Tạo nhân viên thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
                
                // Reload users - reload từ bookings
                window.location.reload();
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

            // Reload users - reload từ bookings
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa người dùng. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Đang tải danh sách người dùng..." />;
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

            {/* Search and Sort Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        {/* Search */}
                        <div className="col-md-6">
                            <label className="form-label small">Tìm kiếm</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <MagnifyingGlassIcon className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tìm theo tên, email, số điện thoại..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="col-md-3">
                            <label className="form-label small">Sắp xếp theo</label>
                            <select
                                className="form-select"
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="createdAt">Ngày tạo</option>
                                <option value="fullName">Tên</option>
                                <option value="email">Email</option>
                            </select>
                        </div>

                        {/* Sort Direction */}
                        <div className="col-md-3">
                            <label className="form-label small">Thứ tự</label>
                            <select
                                className="form-select"
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
                </div>
            </div>

            {!isLoading && (
                <p className="text-muted small mb-3">
                    Tổng cộng: <span className="font-semibold">{totalItems}</span> người dùng có đơn đặt hàng
                </p>
            )}

            <UsersTable users={users} currentUser={currentUser} onEdit={handleEdit} onDelete={handleDelete} />

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

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