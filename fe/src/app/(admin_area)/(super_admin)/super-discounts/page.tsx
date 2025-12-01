"use client";

import { useState, useEffect } from "react";
import { getDiscounts } from "@/lib/Super_Admin/discountService";
import { createDiscountAction, updateDiscountAction, deleteDiscountAction } from "@/lib/actions/discountActions";
import DiscountsTable from "@/components/AdminSuper/discounts/DiscountsTable";
import Pagination from "@/components/Admin/pagination/Pagination";
import type { SuperDiscount } from "@/types";
import DiscountFormModal from "@/components/AdminSuper/discounts/DiscountFormModal";
import { toast } from "react-toastify";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 10;

export default function SuperDiscountsPage() {
    const [discounts, setDiscounts] = useState<SuperDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<SuperDiscount | null>(null);

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
    const [filterSpecialDayId, setFilterSpecialDayId] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('created-at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Helper function để parse số từ string, trả về undefined nếu không hợp lệ
    const parseNumberFilter = (value: string | undefined): number | undefined => {
        if (!value || value.trim() === '') return undefined;
        const num = Number(value.trim());
        return !isNaN(num) && isFinite(num) ? num : undefined;
    };

    // Helper function để parse string filter, trả về undefined nếu empty
    const parseStringFilter = (value: string | undefined): string | undefined => {
        if (!value || value.trim() === '') return undefined;
        return value.trim();
    };

    // Kiểm tra xem có filter nào đang active không (chỉ tính các filter có giá trị thực sự)
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
        parseStringFilter(filterSpecialDayId) !== undefined ||
        (sortBy && sortBy !== 'created-at') ||
        (sortDir && sortDir !== 'asc');

    const loadDiscounts = async () => {
        setIsLoading(true);
        try {
            // Xử lý filter: chỉ gửi giá trị hợp lệ (không phải empty string, không phải NaN)
            const response = await getDiscounts({
                page: currentPage,
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
                specialDayId: parseStringFilter(filterSpecialDayId),
                sortBy: sortBy || 'created-at',
                sortDir: sortDir || 'asc'
            });
            setDiscounts(response.content);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải danh sách mã giảm giá', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDiscounts();
    }, [currentPage, filterCode, filterActive, filterCurrentlyValid, filterValidFrom, filterValidTo,
        filterMinPercentage, filterMaxPercentage, filterMinBookingPrice, filterMaxBookingPrice,
        filterMinBookingCount, filterMaxBookingCount, filterAvailable, filterExhausted,
        filterMinTimesUsed, filterMaxTimesUsed, filterSpecialDayId, sortBy, sortDir]);

    // Tắt auto-refresh để tránh tự động reload khi user đang làm việc
    // Nếu cần auto-refresh, có thể bật lại bằng cách uncomment code bên dưới
    // useEffect(() => {
    //     if (hasActiveFilters) {
    //         return; // Không auto-refresh khi đang filter
    //     }
    //     const interval = setInterval(() => {
    //         loadDiscounts();
    //     }, 30000);
    //     return () => clearInterval(interval);
    // }, [hasActiveFilters]);

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
        setFilterSpecialDayId('');
        setSortBy('created-at');
        setSortDir('asc');
        setCurrentPage(0);
    };

    const handlePageChange = (page: number) => {
        // Pagination component truyền vào page bắt đầu từ 1, nhưng backend dùng 0-based
        setCurrentPage(page - 1);
    };

    const handleAddNew = () => {
        setEditingDiscount(null);
        setIsModalOpen(true);
    };

    const handleEdit = (discount: SuperDiscount) => {
        setEditingDiscount(discount);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Bạn có chắc muốn xóa mã giảm giá "${code}"?`)) {
            return;
        }

        try {
            await deleteDiscountAction(id);
            toast.success('Xóa mã giảm giá thành công!', {
                position: "top-right",
                autoClose: 2000,
            });

            // Reload data với filters hiện tại
            loadDiscounts();
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa mã giảm giá. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleSave = async (formData: FormData) => {
        try {
            const id = formData.get('id') as string;

            if (id) {
                // Cập nhật
                const result = await updateDiscountAction(formData);
                if (result?.error) {
                    toast.error(result.error, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }
                toast.success('Cập nhật mã giảm giá thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
            } else {
                // Tạo mới
                const result = await createDiscountAction(formData);
                if (result?.error) {
                    toast.error(result.error, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }
                toast.success('Tạo mã giảm giá thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
            }

            // Đóng modal và refresh data
            setIsModalOpen(false);

            // Reload data với filters hiện tại
            loadDiscounts();
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
                    <h1 className="h3 text-dark mb-0">Quản lý Mã giảm giá</h1>
                    {!isLoading && (
                        <p className="text-muted small mb-0 mt-1">
                            Tổng cộng: {totalItems} mã giảm giá
                        </p>
                    )}
                </div>
                <button className="btn btn-primary" onClick={handleAddNew}>
                    + Thêm Mã giảm giá
                </button>
            </div>

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
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleClearFilters();
                                }}
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterCode(e.target.value);
                                    setCurrentPage(0);
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterActive(e.target.value);
                                    setCurrentPage(0);
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterCurrentlyValid(e.target.value);
                                    setCurrentPage(0);
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterAvailable(e.target.value);
                                    setCurrentPage(0);
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterExhausted(e.target.value);
                                    setCurrentPage(0);
                                }}
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Có</option>
                                <option value="false">Không</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div className="col-md-3">
                            <label className="form-label small">
                                <span className="d-flex align-items-center gap-1">
                                    <span>📊 Sắp xếp theo:</span>
                                </span>
                            </label>
                            <select
                                className="form-select form-select-sm"
                                value={sortBy}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSortBy(e.target.value);
                                    setCurrentPage(0);
                                }}
                            >
                                <option value="created-at">📅 Ngày tạo</option>
                                <option value="code">🔖 Mã giảm giá</option>
                                <option value="percentage">📈 Phần trăm giảm giá</option>
                                <option value="valid-from">📆 Ngày bắt đầu hiệu lực</option>
                                <option value="valid-to">📆 Ngày kết thúc hiệu lực</option>
                                <option value="times-used">🔢 Số lần đã sử dụng</option>
                            </select>
                        </div>

                        {/* Sort Direction */}
                        <div className="col-md-3">
                            <label className="form-label small">
                                <span className="d-flex align-items-center gap-1">
                                    <span>🔄 Thứ tự:</span>
                                </span>
                            </label>
                            <select
                                className="form-select form-select-sm"
                                value={sortDir}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSortDir(e.target.value as 'asc' | 'desc');
                                    setCurrentPage(0);
                                }}
                            >
                                <option value="asc">⬆️ Tăng dần (A→Z, 0→9, cũ→mới)</option>
                                <option value="desc">⬇️ Giảm dần (Z→A, 9→0, mới→cũ)</option>
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterValidFrom(e.target.value);
                                    setCurrentPage(0);
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterValidTo(e.target.value);
                                    setCurrentPage(0);
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterMinPercentage(e.target.value);
                                    setCurrentPage(0);
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterMaxPercentage(e.target.value);
                                    setCurrentPage(0);
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterMinBookingPrice(e.target.value);
                                    setCurrentPage(0);
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterMaxBookingPrice(e.target.value);
                                    setCurrentPage(0);
                                }}
                                placeholder="∞"
                                min="0"
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterMinTimesUsed(e.target.value);
                                    setCurrentPage(0);
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterMaxTimesUsed(e.target.value);
                                    setCurrentPage(0);
                                }}
                                placeholder="∞"
                                min="0"
                            />
                        </div>

                        {/* Min Booking Count */}
                        <div className="col-md-2">
                            <label className="form-label small">Số đơn tối thiểu</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={filterMinBookingCount}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterMinBookingCount(e.target.value);
                                    setCurrentPage(0);
                                }}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        {/* Max Booking Count */}
                        <div className="col-md-2">
                            <label className="form-label small">Số đơn tối đa</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={filterMaxBookingCount}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterMaxBookingCount(e.target.value);
                                    setCurrentPage(0);
                                }}
                                placeholder="∞"
                                min="0"
                            />
                        </div>

                        {/* Special Day ID */}
                        <div className="col-md-3">
                            <label className="form-label small">ID Ngày đặc biệt</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                value={filterSpecialDayId}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterSpecialDayId(e.target.value);
                                    setCurrentPage(0);
                                }}
                                placeholder="UUID..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải danh sách mã giảm giá...</p>
                </div>
            ) : (
                <>
                    <DiscountsTable
                        discounts={discounts}
                        currentPage={currentPage}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    {totalPages > 1 && (
                        <div className="mt-4 d-flex justify-content-center">
                            <Pagination
                                currentPage={currentPage + 1} // Convert từ 0-based sang 1-based
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}

            <DiscountFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                discount={editingDiscount}
            />
        </div>
    );
}

