"use client";

import { useState, useEffect } from "react";
import { getAdminHotelPerformanceReport } from "@/lib/Super_Admin/superAdminReportsService";
import type { HotelPerformance } from "@/lib/Super_Admin/superAdminReportsService";
import Pagination from "@/components/Admin/pagination/Pagination";
import { FaChartBar, FaCalendarAlt, FaSort } from "react-icons/fa";

const ITEMS_PER_PAGE = 20;

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
};

export default function SuperBookingStatPage() {
    const [data, setData] = useState<HotelPerformance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    
    // Filter states
    const [fromDate, setFromDate] = useState<string>(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState<string>(() => {
        return new Date().toISOString().split('T')[0];
    });
    
    // Sort states
    const [sortBy, setSortBy] = useState<'revenue' | 'occupancy' | 'bookings' | 'cancellationRate'>('bookings');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const fetchData = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            const result = await getAdminHotelPerformanceReport(
                fromDate,
                toDate,
                sortBy,
                sortDir,
                undefined, // cityId
                undefined, // provinceId
                page,
                ITEMS_PER_PAGE
            );
            setData(result as HotelPerformance);
        } catch (err: any) {
            console.error("Error fetching booking statistics:", err);
            setError(err?.response?.data?.message || "Không thể tải dữ liệu thống kê");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, fromDate, toDate, sortBy, sortDir]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1); // API uses 0-indexed, component uses 1-indexed
    };

    const handleFilter = () => {
        setCurrentPage(0);
        fetchData(0);
    };

    const handleSort = (newSortBy: 'revenue' | 'occupancy' | 'bookings' | 'cancellationRate') => {
        if (sortBy === newSortBy) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortDir('desc');
        }
        setCurrentPage(0);
    };

    const getSortIcon = (column: 'revenue' | 'occupancy' | 'bookings' | 'cancellationRate') => {
        if (sortBy !== column) {
            return <FaSort className="text-gray-400" />;
        }
        return sortDir === 'asc' ? (
            <FaSort className="text-blue-600 rotate-180" />
        ) : (
            <FaSort className="text-blue-600" />
        );
    };

    return (
        <div className="px-4 py-3">
            <div className="mb-4 pb-3 border-b border-gray-300">
                <div className="d-flex align-items-center gap-2 mb-2">
                    <FaChartBar className="text-info" size={24} />
                    <h2 className="h4 mb-0 fw-bold">Thống kê đặt phòng</h2>
                </div>
                <p className="text-muted mb-0">
                    Thống kê lượng đặt phòng theo khách sạn trong hệ thống
                </p>
            </div>

            {/* Filters */}
            <div className="mb-4 p-3 bg-white rounded shadow-sm">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">
                            <FaCalendarAlt className="me-1" />
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">
                            <FaCalendarAlt className="me-1" />
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Sắp xếp theo</label>
                        <select
                            className="form-select"
                            value={sortBy}
                            onChange={(e) => handleSort(e.target.value as any)}
                        >
                            <option value="bookings">Tổng đơn đã tạo</option>
                            <option value="revenue">Doanh thu</option>
                            <option value="occupancy">Tỷ lệ lấp đầy</option>
                            <option value="cancellationRate">Tỷ lệ hủy</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <button
                            className="btn btn-info w-100"
                            onClick={handleFilter}
                            disabled={loading}
                        >
                            Áp dụng bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary */}
            {data && (
                <div className="mb-3">
                    <p className="text-muted mb-0">
                        Tổng số khách sạn: <strong>{data.totalItems}</strong> | 
                        Trang {data.page + 1} / {data.totalPages}
                    </p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    <strong>Lỗi:</strong> {error}
                </div>
            )}

            {/* Table */}
            {!loading && !error && data && (
                <>
                    <div className="table-responsive">
                        <table className="table table-hover table-bordered bg-white">
                            <thead className="bg-gradient-to-br from-white to-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left font-bold text-gray-900" style={{ width: '1cm', minWidth: '1cm' }}>
                                        STT
                                    </th>
                                    <th 
                                        className="px-3 py-3 text-left font-bold text-gray-900"
                                        style={{ width: '4cm', minWidth: '4cm' }}
                                    >
                                        Tên khách sạn
                                    </th>
                                    <th 
                                        className="px-3 py-3 text-left font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                                        style={{ width: '2.5cm', minWidth: '2.5cm' }}
                                        onClick={() => handleSort('bookings')}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            Tổng đơn đã tạo
                                            {getSortIcon('bookings')}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-3 py-3 text-left font-bold text-gray-900"
                                        style={{ width: '2.5cm', minWidth: '2.5cm' }}
                                    >
                                        Tổng đơn hoàn thành
                                    </th>
                                    <th 
                                        className="px-3 py-3 text-left font-bold text-gray-900"
                                        style={{ width: '2.5cm', minWidth: '2.5cm' }}
                                    >
                                        Tổng đơn đã hủy
                                    </th>
                                    <th 
                                        className="px-3 py-3 text-left font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                                        style={{ width: '2cm', minWidth: '2cm' }}
                                        onClick={() => handleSort('cancellationRate')}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            Tỷ lệ hủy (%)
                                            {getSortIcon('cancellationRate')}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-3 py-3 text-left font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                                        style={{ width: '2cm', minWidth: '2cm' }}
                                        onClick={() => handleSort('occupancy')}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            Tỷ lệ lấp đầy (%)
                                            {getSortIcon('occupancy')}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-3 py-3 text-left font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                                        style={{ width: '2.5cm', minWidth: '2.5cm' }}
                                        onClick={() => handleSort('revenue')}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            Doanh thu
                                            {getSortIcon('revenue')}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-4 text-muted">
                                            Không có dữ liệu trong khoảng thời gian đã chọn
                                        </td>
                                    </tr>
                                ) : (
                                    data.data.map((hotel, index) => (
                                        <tr key={hotel.hotelId}>
                                            <td className="px-3 py-2">
                                                {data.page * ITEMS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="px-3 py-2 fw-semibold">
                                                {hotel.hotelName}
                                            </td>
                                            <td className="px-3 py-2">
                                                {hotel.totalCreatedBookings.toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-3 py-2 text-success">
                                                {hotel.totalCompletedBookings.toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-3 py-2 text-danger">
                                                {hotel.totalCancelledBookings.toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={hotel.cancellationRate > 20 ? 'text-danger' : hotel.cancellationRate > 10 ? 'text-warning' : 'text-success'}>
                                                    {formatPercentage(hotel.cancellationRate)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={hotel.averageOccupancyRate > 70 ? 'text-success' : hotel.averageOccupancyRate > 50 ? 'text-warning' : 'text-danger'}>
                                                    {formatPercentage(hotel.averageOccupancyRate)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 fw-semibold">
                                                {formatCurrency(hotel.totalRevenue)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data.totalPages > 1 && (
                        <div className="mt-4 d-flex justify-content-center">
                            <Pagination
                                currentPage={data.page + 1}
                                totalPages={data.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

