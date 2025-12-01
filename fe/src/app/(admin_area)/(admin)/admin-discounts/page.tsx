// app/admin-discounts/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getDiscounts } from '@/lib/AdminAPI/discountService';
import DiscountsTable from '@/components/Admin/discount/DiscountsTable';
import DiscountFormModal from '@/components/Admin/discount/DiscountFormModal';
import Pagination from '@/components/Admin/pagination/Pagination';
import { PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/Admin/common/LoadingSpinner';
import type { Discount } from '@/types';

function PageHeader({ title, children }: { title: React.ReactNode, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md-items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md-mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

const ITEMS_PER_PAGE = 10;

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // Filter states
    const [filterCode, setFilterCode] = useState<string>('');
    const [filterActive, setFilterActive] = useState<string>(''); // '' | 'true' | 'false'
    const [filterCurrentlyValid, setFilterCurrentlyValid] = useState<string>(''); // '' | 'true' | 'false'
    const [filterValidFrom, setFilterValidFrom] = useState<string>('');
    const [filterValidTo, setFilterValidTo] = useState<string>('');
    const [filterMinPercentage, setFilterMinPercentage] = useState<string>('');
    const [filterMaxPercentage, setFilterMaxPercentage] = useState<string>('');
    const [filterMinBookingPrice, setFilterMinBookingPrice] = useState<string>('');
    const [filterMaxBookingPrice, setFilterMaxBookingPrice] = useState<string>('');
    const [filterMinBookingCount, setFilterMinBookingCount] = useState<string>('');
    const [filterMaxBookingCount, setFilterMaxBookingCount] = useState<string>('');
    const [filterAvailable, setFilterAvailable] = useState<string>(''); // '' | 'true' | 'false'
    const [filterExhausted, setFilterExhausted] = useState<string>(''); // '' | 'true' | 'false'
    const [filterMinTimesUsed, setFilterMinTimesUsed] = useState<string>('');
    const [filterMaxTimesUsed, setFilterMaxTimesUsed] = useState<string>('');
    const [filterHotelId, setFilterHotelId] = useState<string>('');
    const [filterSpecialDayId, setFilterSpecialDayId] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('created-at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Helper functions
    const parseNumberFilter = (value: string | undefined): number | undefined => {
        if (!value || value.trim() === '') return undefined;
        const num = Number(value.trim());
        return !isNaN(num) && isFinite(num) ? num : undefined;
    };

    const parseStringFilter = (value: string | undefined): string | undefined => {
        if (!value || value.trim() === '') return undefined;
        return value.trim();
    };

    // Kiểm tra có filter nào đang active không
    const hasActiveFilters =
        parseStringFilter(filterCode) !== undefined ||
        (filterActive && filterActive !== '') ||
        (filterCurrentlyValid && filterCurrentlyValid !== '') ||
        parseStringFilter(filterValidFrom) !== undefined ||
        parseStringFilter(filterValidTo) !== undefined ||
        parseNumberFilter(filterMinPercentage) !== undefined ||
        parseNumberFilter(filterMaxPercentage) !== undefined ||
        parseNumberFilter(filterMinBookingPrice) !== undefined ||
        parseNumberFilter(filterMaxBookingPrice) !== undefined ||
        parseNumberFilter(filterMinBookingCount) !== undefined ||
        parseNumberFilter(filterMaxBookingCount) !== undefined ||
        (filterAvailable && filterAvailable !== '') ||
        (filterExhausted && filterExhausted !== '') ||
        parseNumberFilter(filterMinTimesUsed) !== undefined ||
        parseNumberFilter(filterMaxTimesUsed) !== undefined ||
        parseStringFilter(filterHotelId) !== undefined ||
        parseStringFilter(filterSpecialDayId) !== undefined ||
        (sortBy && sortBy !== 'created-at') ||
        (sortDir && sortDir !== 'asc');

    // Hàm lấy dữ liệu sẽ phụ thuộc vào trang hiện tại và filters
    useEffect(() => {
        async function loadDiscounts() {
            setIsLoading(true);
            try {
                const response = await getDiscounts({
                    page: currentPage - 1, // Convert 1-based to 0-based
                    size: ITEMS_PER_PAGE,
                    code: parseStringFilter(filterCode),
                    active: filterActive === 'true' ? true : filterActive === 'false' ? false : undefined,
                    currentlyValid: filterCurrentlyValid === 'true' ? true : filterCurrentlyValid === 'false' ? false : undefined,
                    validFrom: parseStringFilter(filterValidFrom),
                    validTo: parseStringFilter(filterValidTo),
                    minPercentage: parseNumberFilter(filterMinPercentage),
                    maxPercentage: parseNumberFilter(filterMaxPercentage),
                    minBookingPrice: parseNumberFilter(filterMinBookingPrice),
                    maxBookingPrice: parseNumberFilter(filterMaxBookingPrice),
                    minBookingCount: parseNumberFilter(filterMinBookingCount),
                    maxBookingCount: parseNumberFilter(filterMaxBookingCount),
                    available: filterAvailable === 'true' ? true : filterAvailable === 'false' ? false : undefined,
                    exhausted: filterExhausted === 'true' ? true : filterExhausted === 'false' ? false : undefined,
                    minTimesUsed: parseNumberFilter(filterMinTimesUsed),
                    maxTimesUsed: parseNumberFilter(filterMaxTimesUsed),
                    hotelId: parseStringFilter(filterHotelId),
                    specialDayId: parseStringFilter(filterSpecialDayId),
                    sortBy: sortBy || 'created-at',
                    sortDir: sortDir || 'asc'
                });
                setDiscounts(response.data);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
            } catch (error: any) {
                alert('Không thể tải danh sách mã giảm giá: ' + (error.message || 'Lỗi không xác định'));
                setDiscounts([]);
                setTotalPages(0);
                setTotalItems(0);
            } finally {
                setIsLoading(false);
            }
        }
        loadDiscounts();
    }, [currentPage, filterCode, filterActive, filterCurrentlyValid, filterValidFrom, filterValidTo,
        filterMinPercentage, filterMaxPercentage, filterMinBookingPrice, filterMaxBookingPrice,
        filterMinBookingCount, filterMaxBookingCount, filterAvailable, filterExhausted,
        filterMinTimesUsed, filterMaxTimesUsed, filterHotelId, filterSpecialDayId, sortBy, sortDir]);

    const handleClearFilters = () => {
        setFilterCode('');
        setFilterActive('');
        setFilterCurrentlyValid('');
        setFilterValidFrom('');
        setFilterValidTo('');
        setFilterMinPercentage('');
        setFilterMaxPercentage('');
        setFilterMinBookingPrice('');
        setFilterMaxBookingPrice('');
        setFilterMinBookingCount('');
        setFilterMaxBookingCount('');
        setFilterAvailable('');
        setFilterExhausted('');
        setFilterMinTimesUsed('');
        setFilterMaxTimesUsed('');
        setFilterHotelId('');
        setFilterSpecialDayId('');
        setSortBy('created-at');
        setSortDir('asc');
        setCurrentPage(1);
    };
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (discount: Discount) => {
        setEditingDiscount(discount);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingDiscount(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDiscount(null);
    };

    return (
        <div>
            <PageHeader title={<span style={{ color: '#2563eb' }}>Quản lý Mã giảm giá</span>}>
                <button
                    onClick={handleAddNew}
                    className="inline-flex gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm mã giảm giá
                </button>
            </PageHeader>

            {/* Filter Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <FunnelIcon className="h-5 w-5 text-primary" />
                            <h5 className="mb-0">Bộ lọc và Tìm kiếm</h5>
                        </div>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="btn btn-sm btn-outline-danger"
                            >
                                <XMarkIcon className="h-4 w-4 me-1" />
                                Xóa tất cả
                            </button>
                        )}
                    </div>

                    <div className="row g-3">
                        {/* Code Filter */}
                        <div className="col-md-3">
                            <label className="form-label small">Mã giảm giá</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                value={filterCode}
                                onChange={(e) => {
                                    setFilterCode(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Nhập mã..."
                            />
                        </div>

                        {/* Active Filter */}
                        <div className="col-md-2">
                            <label className="form-label small">Trạng thái</label>
                            <select
                                className="form-select form-select-sm"
                                value={filterActive}
                                onChange={(e) => {
                                    setFilterActive(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Vô hiệu hóa</option>
                            </select>
                        </div>

                        {/* Currently Valid Filter */}
                        <div className="col-md-2">
                            <label className="form-label small">Hiện tại hợp lệ</label>
                            <select
                                className="form-select form-select-sm"
                                value={filterCurrentlyValid}
                                onChange={(e) => {
                                    setFilterCurrentlyValid(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Có</option>
                                <option value="false">Không</option>
                            </select>
                        </div>

                        {/* Available Filter */}
                        <div className="col-md-2">
                            <label className="form-label small">Còn sử dụng</label>
                            <select
                                className="form-select form-select-sm"
                                value={filterAvailable}
                                onChange={(e) => {
                                    setFilterAvailable(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Có</option>
                                <option value="false">Không</option>
                            </select>
                        </div>

                        {/* Exhausted Filter */}
                        <div className="col-md-2">
                            <label className="form-label small">Đã hết</label>
                            <select
                                className="form-select form-select-sm"
                                value={filterExhausted}
                                onChange={(e) => {
                                    setFilterExhausted(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Có</option>
                                <option value="false">Không</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div className="col-md-3">
                            <label className="form-label small">Sắp xếp theo</label>
                            <select
                                className="form-select form-select-sm"
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="created-at">Ngày tạo</option>
                                <option value="code">Mã giảm giá</option>
                                <option value="percentage">Phần trăm giảm giá</option>
                                <option value="valid-from">Ngày bắt đầu hiệu lực</option>
                                <option value="valid-to">Ngày kết thúc hiệu lực</option>
                                <option value="usage-limit">Giới hạn sử dụng</option>
                                <option value="times-used">Số lần đã sử dụng</option>
                                <option value="min-booking-price">Giá đơn tối thiểu</option>
                            </select>
                        </div>

                        {/* Sort Direction */}
                        <div className="col-md-3">
                            <label className="form-label small">Thứ tự</label>
                            <select
                                className="form-select form-select-sm"
                                value={sortDir}
                                onChange={(e) => {
                                    setSortDir(e.target.value as 'asc' | 'desc');
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="asc">Tăng dần</option>
                                <option value="desc">Giảm dần</option>
                            </select>
                        </div>

                        {/* Valid From */}
                        <div className="col-md-3">
                            <label className="form-label small">Hiệu lực từ</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={filterValidFrom}
                                onChange={(e) => {
                                    setFilterValidFrom(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* Valid To */}
                        <div className="col-md-3">
                            <label className="form-label small">Hiệu lực đến</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={filterValidTo}
                                onChange={(e) => {
                                    setFilterValidTo(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* Min Percentage */}
                        <div className="col-md-2">
                            <label className="form-label small">% tối thiểu</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={filterMinPercentage}
                                onChange={(e) => {
                                    setFilterMinPercentage(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="0"
                                min="0"
                                max="100"
                            />
                        </div>

                        {/* Max Percentage */}
                        <div className="col-md-2">
                            <label className="form-label small">% tối đa</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={filterMaxPercentage}
                                onChange={(e) => {
                                    setFilterMaxPercentage(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="100"
                                min="0"
                                max="100"
                            />
                        </div>

                        {/* Min Booking Price */}
                        <div className="col-md-2">
                            <label className="form-label small">Giá đơn tối thiểu</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={filterMinBookingPrice}
                                onChange={(e) => {
                                    setFilterMinBookingPrice(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        {/* Max Booking Price */}
                        <div className="col-md-2">
                            <label className="form-label small">Giá đơn tối đa</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={filterMaxBookingPrice}
                                onChange={(e) => {
                                    setFilterMaxBookingPrice(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="∞"
                                min="0"
                            />
                        </div>

                        {/* Min Booking Count */}
                        <div className="col-md-2">
                            <label className="form-label small">Số phòng tối thiểu</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={filterMinBookingCount}
                                onChange={(e) => {
                                    setFilterMinBookingCount(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="0"
                                min="1"
                            />
                        </div>

                        {/* Max Booking Count */}
                        <div className="col-md-2">
                            <label className="form-label small">Số phòng tối đa</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={filterMaxBookingCount}
                                onChange={(e) => {
                                    setFilterMaxBookingCount(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="∞"
                                min="1"
                            />
                        </div>

                        {/* Min Times Used */}
                        <div className="col-md-2">
                            <label className="form-label small">Số lần dùng tối thiểu</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={filterMinTimesUsed}
                                onChange={(e) => {
                                    setFilterMinTimesUsed(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        {/* Max Times Used */}
                        <div className="col-md-2">
                            <label className="form-label small">Số lần dùng tối đa</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={filterMaxTimesUsed}
                                onChange={(e) => {
                                    setFilterMaxTimesUsed(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="∞"
                                min="0"
                            />
                        </div>

                        {/* Hotel ID Filter */}
                        <div className="col-md-3">
                            <label className="form-label small">ID Khách sạn</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                value={filterHotelId}
                                onChange={(e) => {
                                    setFilterHotelId(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="UUID khách sạn..."
                            />
                        </div>

                        {/* Special Day ID Filter */}
                        <div className="col-md-3">
                            <label className="form-label small">ID Ngày đặc biệt</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                value={filterSpecialDayId}
                                onChange={(e) => {
                                    setFilterSpecialDayId(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="UUID ngày đặc biệt..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner message="Đang tải danh sách mã giảm giá..." />
            ) : (
                <>
                    {!isLoading && (
                        <p className="text-muted small mb-3">
                            Tổng cộng: <span className="font-semibold">{totalItems}</span> mã giảm giá
                        </p>
                    )}
                    <DiscountsTable discounts={discounts} onEdit={handleEdit} />
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}

            <DiscountFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                discount={editingDiscount}
            />
        </div>
    );
}