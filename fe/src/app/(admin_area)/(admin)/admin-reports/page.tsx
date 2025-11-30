"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import { getBookings } from '@/lib/AdminAPI/bookingService';
import {
    getPartnerRevenueReport,
    getPartnerBookingsSummary,
    getPartnerOccupancyReport,
    getPartnerRoomPerformance,
    getPartnerCustomerSummary,
    getPartnerReviewsSummary,
} from '@/lib/PartnerAPI/partnerReportsService';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type ReportType = 'revenue' | 'bookings' | 'occupancy' | 'rooms' | 'customers' | 'reviews';

export default function PartnerReportsPage() {
    const { effectiveUser } = useAuth();
    const [selectedHotelId, setSelectedHotelId] = useState<string>('');
    const [hotels, setHotels] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<ReportType>('revenue');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('day');
    const [compareEnabled, setCompareEnabled] = useState(false);
    const [compareDateRange, setCompareDateRange] = useState({ from: '', to: '' });
    const [reportData, setReportData] = useState<any>(null);
    const [customerDetails, setCustomerDetails] = useState<any[]>([]); // Danh sách khách hàng chi tiết
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0); // Force reload khi cần

    // Helper function: Tính revenue từ bookings (fallback khi API reports chưa có data)
    const calculateRevenueFromBookings = async (
        hotelId: string,
        from: string,
        to: string,
        groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year'
    ) => {
        try {
            
            // Lấy tất cả bookings của hotel này
            const allBookings: any[] = [];
            let currentPage = 0;
            let hasMore = true;

            while (hasMore && currentPage < 10) {
                const response = await getBookings({
                    page: currentPage,
                    size: 100,
                    hotelId: hotelId, // QUAN TRỌNG: Chỉ lấy bookings của hotel này
                    sortBy: 'createdAt',
                    sortDir: 'DESC',
                    roleName: effectiveUser?.role?.name,
                    currentUserId: effectiveUser?.id,
                });

                allBookings.push(...response.data);
                hasMore = response.totalPages > currentPage + 1;
                currentPage++;
            }


            // Filter bookings trong khoảng thời gian (theo checkOutDate - khi khách đã checkout và thanh toán)
            const fromDate = new Date(from);
            fromDate.setHours(0, 0, 0, 0);
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);

            const bookingsInRange = allBookings.filter((booking: any) => {
                if (!booking.checkOutDate) {
                    return false;
                }
                const checkOutDate = new Date(booking.checkOutDate);
                checkOutDate.setHours(0, 0, 0, 0); // Reset time để so sánh chính xác
                const inRange = checkOutDate >= fromDate && checkOutDate <= toDate;
                
                if (inRange) {
                    console.log('[PartnerReportsPage] Booking in range:', {
                        id: booking.id,
                        checkOutDate: booking.checkOutDate,
                        totalAmount: booking.totalAmount,
                        status: booking.bookingStatus,
                    });
                }
                
                return inRange;
            });

            console.log('[PartnerReportsPage] Bookings in date range:', {
                total: bookingsInRange.length,
                dateRange: { from: fromDate.toISOString(), to: toDate.toISOString() },
                sampleBookings: bookingsInRange.slice(0, 3).map((b: any) => ({
                    id: b.id,
                    checkOutDate: b.checkOutDate,
                    totalAmount: b.totalAmount,
                })),
            });

            // Lọc chỉ lấy bookings đã thanh toán (confirmed, completed, checked_in)
            const paidBookings = bookingsInRange.filter(booking => {
                const status = booking.bookingStatus?.toLowerCase();
                return status === 'confirmed' || status === 'completed' || status === 'checked_in';
            });


            // Nhóm theo period và tính tổng revenue
            const revenueMap: { [key: string]: number } = {};

            paidBookings.forEach(booking => {
                // Lấy finalPrice từ booking (totalAmount từ booking service)
                const revenue = booking.totalAmount || 0;
                
                if (revenue <= 0) {
                    return;
                }
                
                // Xác định period dựa trên groupBy
                const checkOutDate = new Date(booking.checkOutDate);
                checkOutDate.setHours(0, 0, 0, 0); // Reset time để group chính xác
                let periodKey = '';

                if (groupBy === 'day') {
                    // Group theo ngày: YYYY-MM-DD
                    periodKey = checkOutDate.toISOString().split('T')[0];
                } else if (groupBy === 'week') {
                    // Group theo tuần: Lấy ngày đầu tuần (Thứ 2)
                    const weekStart = new Date(checkOutDate);
                    const dayOfWeek = checkOutDate.getDay();
                    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Chủ nhật = 0, cần về thứ 2
                    weekStart.setDate(checkOutDate.getDate() - daysToMonday);
                    weekStart.setHours(0, 0, 0, 0);
                    periodKey = weekStart.toISOString().split('T')[0];
                } else if (groupBy === 'month') {
                    // Group theo tháng: YYYY-MM-01
                    periodKey = `${checkOutDate.getFullYear()}-${String(checkOutDate.getMonth() + 1).padStart(2, '0')}-01`;
                } else if (groupBy === 'quarter') {
                    // Group theo quý: YYYY-Q1, YYYY-Q2, YYYY-Q3, YYYY-Q4
                    const quarter = Math.floor(checkOutDate.getMonth() / 3) + 1;
                    periodKey = `${checkOutDate.getFullYear()}-Q${quarter}`;
                } else if (groupBy === 'year') {
                    // Group theo năm: YYYY
                    periodKey = `${checkOutDate.getFullYear()}`;
                }

                if (periodKey) {
                    const oldRevenue = revenueMap[periodKey] || 0;
                    revenueMap[periodKey] = oldRevenue + revenue;
                    console.log('[PartnerReportsPage] Added revenue to period:', {
                        periodKey,
                        bookingId: booking.id,
                        bookingRevenue: revenue,
                        periodTotalBefore: oldRevenue,
                        periodTotalAfter: revenueMap[periodKey],
                    });
                }
            });

            // Tạo đầy đủ các periods trong khoảng thời gian (để chart hiển thị đúng)
            const periods: string[] = [];
            const currentDate = new Date(fromDate);
            const endDate = new Date(toDate);

            while (currentDate <= endDate) {
                let periodKey = '';
                
                if (groupBy === 'day') {
                    periodKey = currentDate.toISOString().split('T')[0];
                    currentDate.setDate(currentDate.getDate() + 1);
                } else if (groupBy === 'week') {
                    const dayOfWeek = currentDate.getDay();
                    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    const weekStart = new Date(currentDate);
                    weekStart.setDate(currentDate.getDate() - daysToMonday);
                    weekStart.setHours(0, 0, 0, 0);
                    periodKey = weekStart.toISOString().split('T')[0];
                    currentDate.setDate(currentDate.getDate() + 7);
                } else if (groupBy === 'month') {
                    periodKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }

                if (periodKey && !periods.includes(periodKey)) {
                    periods.push(periodKey);
                }
            }

            // Convert sang array format giống API response
            // CHỈ LẤY periods có revenue > 0 (không lấy periods không có data)
            const data = Object.entries(revenueMap)
                .map(([period, revenue]) => ({
                    period,
                    revenue: revenue || 0,
                }))
                .sort((a, b) => a.period.localeCompare(b.period));

            // Tính tổng doanh thu CHỈ từ periods có revenue > 0
            const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);

            console.log('[PartnerReportsPage] Calculated revenue:', {
                totalBookingsLoaded: allBookings.length,
                bookingsInDateRange: bookingsInRange.length,
                paidBookings: paidBookings.length,
                periodsWithRevenue: Object.keys(revenueMap).length,
                totalRevenue,
                dataLength: data.length,
                data,
                revenueMap,
            });

            return {
                data,
                summary: {
                    totalRevenue,
                },
            };
        } catch (err: any) {
            throw err;
        }
    };

    // Helper function: Tính bookings summary theo groupBy từ raw bookings data
    const calculateBookingsSummaryByGroup = async (
        hotelId: string,
        from: string,
        to: string,
        groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year'
    ) => {
        try {
            
            // Lấy tất cả bookings của hotel này
            const allBookings: any[] = [];
            let currentPage = 0;
            let hasMore = true;

            // Lấy tất cả bookings (không giới hạn số pages, giống như trang quản lý đặt phòng)
            while (hasMore) {
                const response = await getBookings({
                    page: currentPage,
                    size: 1000, // Lấy nhiều hơn mỗi page để giảm số lần gọi API
                    hotelId: hotelId,
                    sortBy: 'createdAt',
                    sortDir: 'DESC',
                    roleName: effectiveUser?.role?.name,
                    currentUserId: effectiveUser?.id,
                });

                allBookings.push(...response.data);
                hasMore = response.totalPages > currentPage + 1;
                currentPage++;
            }

            console.log('[PartnerReportsPage] Sample bookings:', allBookings.slice(0, 3).map((b: any) => ({
                id: b.id,
                createdAt: b.createdAt,
                bookingStatus: b.bookingStatus,
                totalAmount: b.totalAmount,
            })));

            // Filter bookings trong khoảng thời gian (theo createdAt hoặc checkInDate - khi booking được tạo hoặc check-in)
            const fromDate = new Date(from);
            fromDate.setHours(0, 0, 0, 0);
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);

            const bookingsInRange = allBookings.filter((booking: any) => {
                // Dùng createdAt nếu có, nếu không thì dùng checkInDate làm fallback
                let bookingDate: Date | null = null;
                
                if (booking.createdAt) {
                    bookingDate = new Date(booking.createdAt);
                } else if (booking.checkInDate) {
                    // Fallback: dùng checkInDate nếu không có createdAt
                    bookingDate = new Date(booking.checkInDate);
                } else {
                    return false;
                }
                
                bookingDate.setHours(0, 0, 0, 0);
                return bookingDate >= fromDate && bookingDate <= toDate;
            });


            // Nhóm theo period và tính tổng các trạng thái
            const summaryMap: { [key: string]: {
                totalCreated: number;
                totalCompleted: number;
                totalCancelled: number;
                totalPending: number;
                totalConfirmed: number;
                totalCheckedIn: number;
            } } = {};

            bookingsInRange.forEach(booking => {
                // Dùng createdAt nếu có, nếu không thì dùng checkInDate làm fallback
                let bookingDate: Date;
                
                if (booking.createdAt) {
                    bookingDate = new Date(booking.createdAt);
                } else if (booking.checkInDate) {
                    bookingDate = new Date(booking.checkInDate);
                } else {
                    return; // Skip booking này
                }
                
                bookingDate.setHours(0, 0, 0, 0);
                let periodKey = '';

                if (groupBy === 'day') {
                    periodKey = bookingDate.toISOString().split('T')[0];
                } else if (groupBy === 'week') {
                    const weekStart = new Date(bookingDate);
                    const dayOfWeek = bookingDate.getDay();
                    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    weekStart.setDate(bookingDate.getDate() - daysToMonday);
                    weekStart.setHours(0, 0, 0, 0);
                    periodKey = weekStart.toISOString().split('T')[0];
                } else if (groupBy === 'month') {
                    periodKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-01`;
                } else if (groupBy === 'quarter') {
                    const quarter = Math.floor(bookingDate.getMonth() / 3) + 1;
                    periodKey = `${bookingDate.getFullYear()}-Q${quarter}`;
                } else if (groupBy === 'year') {
                    periodKey = `${bookingDate.getFullYear()}`;
                }

                if (periodKey) {
                    if (!summaryMap[periodKey]) {
                        summaryMap[periodKey] = {
                            totalCreated: 0,
                            totalCompleted: 0,
                            totalCancelled: 0,
                            totalPending: 0,
                            totalConfirmed: 0,
                            totalCheckedIn: 0,
                        };
                    }

                    summaryMap[periodKey].totalCreated += 1;

                    // Map status (có thể có nhiều format: 'CONFIRMED', 'Confirmed', 'confirmed', etc.)
                    const status = (booking.bookingStatus || '').toLowerCase().replace(/_/g, '');
                    
                    if (status === 'completed' || status === 'hoàn thành') {
                        summaryMap[periodKey].totalCompleted += 1;
                    } else if (status === 'cancelled' || status === 'đã hủy' || status === 'hủy') {
                        summaryMap[periodKey].totalCancelled += 1;
                    } else if (status === 'pending' || status === 'pendingpayment' || status === 'chưa thanh toán' || status === 'đang chờ') {
                        summaryMap[periodKey].totalPending += 1;
                    } else if (status === 'confirmed' || status === 'đã xác nhận' || status === 'xác nhận') {
                        summaryMap[periodKey].totalConfirmed += 1;
                    } else if (status === 'checkedin' || status === 'đã check-in' || status === 'check-in') {
                        summaryMap[periodKey].totalCheckedIn += 1;
                    } else {
                        // Log status không match để debug
                    }
                }
            });

            // Tạo đầy đủ các periods trong khoảng thời gian
            const periods: string[] = [];
            const currentDate = new Date(fromDate);
            const endDate = new Date(toDate);

            while (currentDate <= endDate) {
                let periodKey = '';
                
                if (groupBy === 'day') {
                    periodKey = currentDate.toISOString().split('T')[0];
                    currentDate.setDate(currentDate.getDate() + 1);
                } else if (groupBy === 'week') {
                    const dayOfWeek = currentDate.getDay();
                    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    const weekStart = new Date(currentDate);
                    weekStart.setDate(currentDate.getDate() - daysToMonday);
                    weekStart.setHours(0, 0, 0, 0);
                    periodKey = weekStart.toISOString().split('T')[0];
                    currentDate.setDate(currentDate.getDate() + 7);
                } else if (groupBy === 'month') {
                    periodKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }

                if (periodKey && !periods.includes(periodKey)) {
                    periods.push(periodKey);
                }
            }

            // Convert sang array format
            const data = periods
                .map(period => {
                    const summary = summaryMap[period] || {
                        totalCreated: 0,
                        totalCompleted: 0,
                        totalCancelled: 0,
                        totalPending: 0,
                        totalConfirmed: 0,
                        totalCheckedIn: 0,
                    };
                    return {
                        period,
                        ...summary,
                        cancellationRate: summary.totalCreated > 0 
                            ? (summary.totalCancelled / summary.totalCreated) * 100 
                            : 0,
                    };
                })
                .sort((a, b) => a.period.localeCompare(b.period));

            // Tính tổng
            const totalCreated = data.reduce((sum, item) => sum + item.totalCreated, 0);
            const totalCompleted = data.reduce((sum, item) => sum + item.totalCompleted, 0);
            const totalCancelled = data.reduce((sum, item) => sum + item.totalCancelled, 0);
            const totalPending = data.reduce((sum, item) => sum + item.totalPending, 0);
            const totalConfirmed = data.reduce((sum, item) => sum + item.totalConfirmed, 0);
            const totalCheckedIn = data.reduce((sum, item) => sum + item.totalCheckedIn, 0);

            console.log('[PartnerReportsPage] Calculated bookings summary by group:', {
                dataLength: data.length,
                totalCreated,
                totalCompleted,
                totalCancelled,
                data,
            });

            return {
                data,
                summary: {
                    totalCreated,
                    totalCompleted,
                    totalCancelled,
                    totalPending,
                    totalConfirmed,
                    totalCheckedIn,
                    cancellationRate: totalCreated > 0 ? (totalCancelled / totalCreated) * 100 : 0,
                },
            };
        } catch (err: any) {
            throw err;
        }
    };

    // Initialize dates - luôn cập nhật đến ngày hôm nay
    useEffect(() => {
        const updateDates = () => {
        const today = new Date();
            // Đảm bảo lấy đúng ngày hôm nay (UTC)
            const todayStr = today.toISOString().split('T')[0];
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
            setDateRange(prev => {
                // Chỉ cập nhật nếu chưa có hoặc ngày "to" cũ hơn hôm nay
                if (!prev.to || prev.to < todayStr) {
                    return {
            from: firstDayThisMonth.toISOString().split('T')[0],
                        to: todayStr,
                    };
                }
                return prev;
        });
        
        setCompareDateRange({
            from: lastMonth.toISOString().split('T')[0],
            to: new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0],
        });
        };
        
        updateDates();
        // Cập nhật lại mỗi phút để đảm bảo luôn có ngày hôm nay
        const interval = setInterval(updateDates, 60000);
        return () => clearInterval(interval);
    }, []);

    // Load hotels
    useEffect(() => {
        const loadHotels = async () => {
            if (!effectiveUser) return;

            const userId = effectiveUser.id;
            const roleName = effectiveUser.role?.name;

            if (roleName?.toLowerCase() === 'partner') {
                try {
                    const hotelsData = await getHotels(0, 1000, undefined, undefined, userId, roleName);
                    setHotels(hotelsData.hotels);
                    if (hotelsData.hotels.length > 0) {
                        setSelectedHotelId(hotelsData.hotels[0].id);
                    }
                } catch (err: any) {
                }
            }
        };

        loadHotels();
    }, [effectiveUser]);

    // Load report data - reload khi thay đổi selectedHotelId, dateRange, groupBy, hoặc activeTab
    useEffect(() => {
        console.log('[PartnerReportsPage] useEffect triggered:', {
            selectedHotelId,
            dateRangeFrom: dateRange.from,
            dateRangeTo: dateRange.to,
            groupBy,
            activeTab,
            compareEnabled,
        });

        if (!selectedHotelId || !dateRange.from || !dateRange.to) {
            return;
        }

        const loadReport = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let data: any;

                const compareParams = compareEnabled && compareDateRange.from && compareDateRange.to
                    ? { compareFrom: compareDateRange.from, compareTo: compareDateRange.to }
                    : {};

                console.log('[PartnerReportsPage] Loading report:', {
                    activeTab,
                    selectedHotelId,
                    dateRange,
                    groupBy,
                    compareParams,
                });

                switch (activeTab) {
                    case 'revenue':
                        try {
                            data = await getPartnerRevenueReport(
                                selectedHotelId,
                                dateRange.from,
                                dateRange.to,
                                groupBy,
                                compareParams.compareFrom,
                                compareParams.compareTo
                            );
                            
                            // Kiểm tra nếu revenue = 0 hoặc không có data, tính từ bookings như fallback
                            const dataArray = ('currentPeriod' in data && data.currentPeriod?.data) 
                                ? data.currentPeriod.data 
                                : (data?.data || []);
                            
                            const hasZeroRevenue = dataArray.length === 0 || dataArray.every((item: any) => (item?.revenue || 0) === 0);
                            
                            if (hasZeroRevenue) {
                                const calculatedData = await calculateRevenueFromBookings(
                                    selectedHotelId,
                                    dateRange.from,
                                    dateRange.to,
                                    groupBy
                                );
                                
                                if (calculatedData && calculatedData.data.length > 0 && calculatedData.summary.totalRevenue > 0) {
                                    data = calculatedData;
                                }
                            }
                        } catch (err: any) {
                            // Fallback: tính từ bookings
                            data = await calculateRevenueFromBookings(
                                selectedHotelId,
                                dateRange.from,
                                dateRange.to,
                                groupBy
                            );
                        }
                        break;
                    case 'bookings':
                        // Tính bookings summary theo groupBy từ raw bookings data
                        data = await calculateBookingsSummaryByGroup(
                            selectedHotelId,
                            dateRange.from,
                            dateRange.to,
                            groupBy
                        );
                        break;
                    case 'occupancy':
                        data = await getPartnerOccupancyReport(
                            selectedHotelId,
                            dateRange.from,
                            dateRange.to,
                            compareParams.compareFrom,
                            compareParams.compareTo
                        );
                        break;
                    case 'rooms':
                        data = await getPartnerRoomPerformance(
                            selectedHotelId,
                            dateRange.from,
                            dateRange.to,
                            'revenue',
                            'desc',
                            compareParams.compareFrom,
                            compareParams.compareTo
                        );
                        break;
                    case 'customers':
                        try {
                        data = await getPartnerCustomerSummary(
                            selectedHotelId,
                            dateRange.from,
                            dateRange.to,
                            compareParams.compareFrom,
                            compareParams.compareTo
                        );
                        } catch (err: any) {
                            // Xử lý lỗi quyền truy cập
                            if (err.response?.status === 403 || err.response?.data?.message?.includes('not allowed')) {
                                throw new Error('Bạn không có quyền truy cập khách sạn này. Vui lòng chọn khách sạn khác.');
                            }
                            throw err;
                        }
                        
                        // Lấy danh sách khách hàng chi tiết từ bookings (giới hạn để tối ưu performance)
                        try {
                            const allBookings: any[] = [];
                            let currentPage = 0;
                            let hasMore = true;
                            const maxPages = 5; // Giới hạn tối đa 5 trang (5000 bookings)

                            while (hasMore && currentPage < maxPages) {
                                const response = await getBookings({
                                    page: currentPage,
                                    size: 1000,
                                    hotelId: selectedHotelId,
                                    sortBy: 'createdAt',
                                    sortDir: 'DESC',
                                    roleName: effectiveUser?.role?.name,
                                    currentUserId: effectiveUser?.id,
                                });

                                allBookings.push(...response.data);
                                hasMore = response.totalPages > currentPage + 1;
                                currentPage++;
                            }

                            const fromDate = new Date(dateRange.from);
                            fromDate.setHours(0, 0, 0, 0);
                            const toDate = new Date(dateRange.to);
                            toDate.setHours(23, 59, 59, 999);

                            // Lọc bookings trong khoảng thời gian
                            const bookingsInRange = allBookings.filter((booking: any) => {
                                let dateToUse: Date | null = null;
                                if (booking.createdAt) {
                                    dateToUse = new Date(booking.createdAt);
                                } else if (booking.checkInDate) {
                                    dateToUse = new Date(booking.checkInDate);
                                } else {
                                    return false;
                                }
                                dateToUse.setHours(0, 0, 0, 0);
                                return dateToUse >= fromDate && dateToUse <= toDate;
                            });

                            // Nhóm theo customer (email hoặc customerName) để xác định khách hàng mới/quay lại
                            const customerMap: { [key: string]: {
                                customerName: string;
                                email: string;
                                phone: string;
                                bookingCount: number;
                                totalAmount: number;
                                firstBookingDate: Date;
                                lastBookingDate: Date;
                                isNewCustomer: boolean;
                            } } = {};

                            bookingsInRange.forEach((booking: any) => {
                                const customerKey = booking.customerEmail || booking.customerName || booking.id;
                                const bookingDate = booking.createdAt ? new Date(booking.createdAt) : (booking.checkInDate ? new Date(booking.checkInDate) : new Date());
                                
                                if (!customerMap[customerKey]) {
                                    // Kiểm tra xem có booking nào trước khoảng thời gian này không
                                    const hasPreviousBooking = allBookings.some((b: any) => {
                                        const bKey = b.customerEmail || b.customerName || b.id;
                                        if (bKey !== customerKey) return false;
                                        const bDate = b.createdAt ? new Date(b.createdAt) : (b.checkInDate ? new Date(b.checkInDate) : new Date());
                                        return bDate < fromDate;
                                    });

                                    customerMap[customerKey] = {
                                        customerName: booking.customerName || 'N/A',
                                        email: booking.customerEmail || booking.email || 'N/A',
                                        phone: booking.phone || 'N/A',
                                        bookingCount: 0,
                                        totalAmount: 0,
                                        firstBookingDate: bookingDate,
                                        lastBookingDate: bookingDate,
                                        isNewCustomer: !hasPreviousBooking,
                                    };
                                }

                                customerMap[customerKey].bookingCount += 1;
                                customerMap[customerKey].totalAmount += (booking.totalAmount || 0);
                                if (bookingDate < customerMap[customerKey].firstBookingDate) {
                                    customerMap[customerKey].firstBookingDate = bookingDate;
                                }
                                if (bookingDate > customerMap[customerKey].lastBookingDate) {
                                    customerMap[customerKey].lastBookingDate = bookingDate;
                                }
                            });

                            const customerList = Object.values(customerMap).sort((a, b) => b.totalAmount - a.totalAmount);
                            setCustomerDetails(customerList);
                        } catch (err: any) {
                            setCustomerDetails([]);
                        }
                        break;
                    case 'reviews':
                        data = await getPartnerReviewsSummary(
                            selectedHotelId,
                            dateRange.from,
                            dateRange.to,
                            compareParams.compareFrom,
                            compareParams.compareTo
                        );
                        break;
                }

                console.log('[PartnerReportsPage] Report data loaded successfully:', {
                    activeTab,
                    hasData: !!data,
                    dataType: typeof data,
                    dataKeys: data ? Object.keys(data) : [],
                });
                
                setReportData(data);
                
                // Reset customerDetails nếu không phải customers tab
                if (activeTab !== 'customers') {
                    setCustomerDetails([]);
                }
            } catch (err: any) {
                console.error('[PartnerReportsPage] Error loading report:', {
                    error: err,
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    activeTab,
                    selectedHotelId,
                    dateRange,
                });
                
                // Xử lý lỗi quyền truy cập cụ thể
                const errorMessage = err.response?.data?.message || err.message || 'Không thể tải báo cáo';
                if (err.response?.status === 403 || errorMessage.includes('not allowed') || errorMessage.includes('ACCESS_DENIED')) {
                    setError(`Lỗi quyền truy cập: ${errorMessage}. Vui lòng kiểm tra lại quyền truy cập khách sạn này hoặc chọn khách sạn khác.`);
                } else {
                    setError(errorMessage);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadReport();
    }, [selectedHotelId, activeTab, dateRange.from, dateRange.to, groupBy, compareEnabled, compareDateRange.from, compareDateRange.to, reloadKey]);

    const exportToExcel = async () => {
        if (!reportData) return;
        
        // Dynamic import xlsx to avoid SSR issues
        const XLSX = await import('xlsx');

        let worksheetData: any[] = [];

        switch (activeTab) {
            case 'revenue':
                if ('currentPeriod' in reportData) {
                    worksheetData = reportData.currentPeriod.data.map((item: any) => ({
                        'Kỳ': item.period,
                        'Doanh thu': item.revenue,
                    }));
                } else {
                    worksheetData = reportData.data.map((item: any) => ({
                        'Kỳ': item.period,
                        'Doanh thu': item.revenue,
                    }));
                }
                break;
            case 'bookings':
                if (reportData?.data && Array.isArray(reportData.data)) {
                    // Có data array theo groupBy
                    worksheetData = reportData.data.map((item: any) => ({
                        'Kỳ': item.period,
                        'Tổng tạo': item.totalCreated || 0,
                        'Đã hoàn thành': item.totalCompleted || 0,
                        'Đã hủy': item.totalCancelled || 0,
                        'Đang chờ': item.totalPending || 0,
                        'Tỷ lệ hủy (%)': ((item?.cancellationRate || 0)).toFixed(2),
                    }));
                } else if ('currentPeriod' in reportData) {
                    worksheetData = [reportData.currentPeriod];
                } else {
                    worksheetData = [reportData];
                }
                break;
            case 'occupancy':
                if ('currentPeriod' in reportData) {
                    worksheetData = reportData.currentPeriod.data.map((item: any) => ({
                        'Ngày': item.date,
                        'Tỷ lệ lấp đầy (%)': item.occupancyRate,
                    }));
                } else {
                    worksheetData = reportData.data.map((item: any) => ({
                        'Ngày': item.date,
                        'Tỷ lệ lấp đầy (%)': item.occupancyRate,
                    }));
                }
                break;
            case 'rooms':
                if ('data' in reportData && Array.isArray(reportData.data)) {
                    worksheetData = reportData.data.map((item: any) => ({
                        'Tên phòng': item.roomName,
                        'View': item.roomView,
                        'Doanh thu': item.totalRevenue || item.currentPeriod?.totalRevenue || 0,
                        'Số đêm đã đặt': item.totalBookedNights || item.currentPeriod?.totalBookedNights || 0,
                    }));
                }
                break;
            case 'customers':
                if ('currentPeriod' in reportData) {
                    worksheetData = [reportData.currentPeriod];
                } else {
                    worksheetData = [reportData];
                }
                break;
            case 'reviews':
                if ('currentPeriod' in reportData) {
                    worksheetData = [reportData.currentPeriod];
                } else {
                    worksheetData = [reportData];
                }
                break;
        }

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo');

        const reportTypeNames: { [key in ReportType]: string } = {
            revenue: 'Doanh thu',
            bookings: 'Đặt phòng',
            occupancy: 'Tỷ lệ lấp đầy',
            rooms: 'Hiệu suất phòng',
            customers: 'Khách hàng',
            reviews: 'Đánh giá',
        };

        XLSX.writeFile(workbook, `BaoCao_${reportTypeNames[activeTab]}_${dateRange.from}_${dateRange.to}.xlsx`);
    };

    const renderChart = () => {
        if (!reportData) {
            return null;
        }

        let chartOptions: ApexOptions | null = null;
        let chartSeries: any[] = [];

        console.log('[PartnerReportsPage] renderChart: Processing chart for', activeTab, {
            hasCurrentPeriod: 'currentPeriod' in reportData,
            hasData: 'data' in reportData,
            reportDataKeys: Object.keys(reportData),
        });

        switch (activeTab) {
            case 'revenue':
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    const currentData = Array.isArray(reportData.currentPeriod.data) 
                        ? reportData.currentPeriod.data 
                        : [];
                    const previousData = Array.isArray(reportData.previousPeriod?.data) 
                        ? reportData.previousPeriod.data 
                        : [];
                    console.log('[PartnerReportsPage] renderChart: Using comparison mode', {
                        currentDataLength: currentData.length,
                        previousDataLength: previousData.length,
                    });
                    chartOptions = {
                        chart: { type: 'line', toolbar: { show: false } },
                        xaxis: {
                            categories: currentData.map((item: any) => item?.period || ''),
                        },
                        yaxis: { title: { text: 'Doanh thu (VND)' } },
                        colors: ['#2563eb', '#10b981'],
                        legend: { position: 'top' },
                    };
                    chartSeries = [
                        {
                            name: 'Kỳ hiện tại',
                            data: currentData.map((item: any) => item?.revenue || 0),
                        },
                        {
                            name: 'Kỳ trước',
                            data: previousData.map((item: any) => item?.revenue || 0),
                        },
                    ];
                } else if (reportData?.data) {
                    const data = Array.isArray(reportData.data) ? reportData.data : [];
                    console.log('[PartnerReportsService] renderChart: Using normal mode', {
                        dataLength: data.length,
                        firstItem: data[0],
                        allItems: data,
                        periods: data.map((item: any) => item?.period),
                        revenues: data.map((item: any) => item?.revenue),
                        groupBy,
                    });
                    
                    // Format period labels dựa trên groupBy
                    const formatPeriodLabel = (period: string) => {
                        if (!period) return '';
                        try {
                            // Xử lý quarter và year format trước (không phải date string)
                            if (groupBy === 'quarter' && period.includes('Q')) {
                                return period.replace('-Q', ' Q');
                            }
                            if (groupBy === 'year' && period.match(/^\d{4}$/)) {
                                return period;
                            }
                            
                            const date = new Date(period);
                            if (isNaN(date.getTime())) return period;
                            
                            if (groupBy === 'day') {
                                return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                            } else if (groupBy === 'week') {
                                const weekEnd = new Date(date);
                                weekEnd.setDate(date.getDate() + 6);
                                return `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
                            } else if (groupBy === 'month') {
                                return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
                            } else if (groupBy === 'quarter') {
                                const quarter = Math.floor(date.getMonth() / 3) + 1;
                                return `Q${quarter} ${date.getFullYear()}`;
                            } else if (groupBy === 'year') {
                                return date.getFullYear().toString();
                            }
                        } catch (e) {
                        }
                        return period;
                    };
                    
                    const categories = data.map((item: any) => {
                        const period = item?.period || '';
                        const formatted = formatPeriodLabel(period);
                        return formatted;
                    });
                    
                    const revenueData = data.map((item: any) => {
                        const revenue = item?.revenue || 0;
                        return typeof revenue === 'number' ? revenue : parseFloat(revenue) || 0;
                    });
                    
                    console.log('[PartnerReportsPage] Chart data prepared:', {
                        categories,
                        revenueData,
                        groupBy,
                    });
                    
                    chartOptions = {
                        chart: { type: 'line', toolbar: { show: false } },
                        xaxis: {
                            categories: categories,
                            labels: {
                                rotate: groupBy === 'month' || groupBy === 'quarter' ? -45 : (groupBy === 'week' ? -15 : 0),
                                style: {
                                    fontSize: groupBy === 'month' || groupBy === 'quarter' ? '10px' : '12px',
                                },
                            },
                        },
                        yaxis: { 
                            title: { text: 'Doanh thu (VND)' },
                            labels: {
                                formatter: (value: number) => {
                                    if (value >= 1000000) {
                                        return (value / 1000000).toFixed(1) + 'M';
                                    } else if (value >= 1000) {
                                        return (value / 1000).toFixed(0) + 'K';
                                    }
                                    return value.toLocaleString('vi-VN');
                                }
                            }
                        },
                        colors: ['#2563eb'],
                        tooltip: {
                            y: {
                                formatter: (value: number) => {
                                    return value.toLocaleString('vi-VN') + ' VND';
                                }
                            }
                        },
                    };
                    chartSeries = [{
                        name: 'Doanh thu',
                        data: revenueData,
                    }];
                } else {
                }
                break;
            case 'bookings':
                // Kiểm tra xem có data array (theo groupBy) hay chỉ là summary object
                if (reportData?.data && Array.isArray(reportData.data)) {
                    // Có data array - hiển thị line chart theo groupBy
                    const data = reportData.data;
                    console.log('[PartnerReportsPage] renderChart: Bookings with groupBy data', {
                        dataLength: data.length,
                        groupBy,
                    });
                    
                    // Format period labels dựa trên groupBy
                    const formatPeriodLabel = (period: string) => {
                        if (!period) return '';
                        try {
                            const date = new Date(period);
                            if (isNaN(date.getTime())) return period;
                            
                            if (groupBy === 'day') {
                                return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                            } else if (groupBy === 'week') {
                                const weekEnd = new Date(date);
                                weekEnd.setDate(date.getDate() + 6);
                                return `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
                            } else if (groupBy === 'month') {
                                return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
                            } else if (groupBy === 'quarter') {
                                if (period.includes('Q')) {
                                    return period.replace('-Q', ' Q');
                                }
                                const quarter = Math.floor(date.getMonth() / 3) + 1;
                                return `Q${quarter} ${date.getFullYear()}`;
                            } else if (groupBy === 'year') {
                                if (period.match(/^\d{4}$/)) {
                                    return period;
                                }
                                return date.getFullYear().toString();
                            }
                        } catch (e) {
                        }
                        return period;
                    };
                    
                    const categories = data.map((item: any) => formatPeriodLabel(item?.period || ''));
                    
                    chartOptions = {
                        chart: { type: 'bar', toolbar: { show: false } },
                        xaxis: {
                            categories: categories,
                            labels: {
                                rotate: groupBy === 'month' || groupBy === 'quarter' ? -45 : (groupBy === 'week' ? -15 : 0),
                                style: {
                                    fontSize: groupBy === 'month' || groupBy === 'quarter' ? '10px' : '12px',
                                },
                            },
                        },
                        yaxis: { 
                            title: { text: 'Số lượng' },
                        },
                        colors: ['#2563eb', '#10b981', '#ef4444', '#f59e0b'],
                        legend: { position: 'top' },
                        plotOptions: {
                            bar: {
                                horizontal: false,
                                columnWidth: '55%',
                                dataLabels: {
                                    position: 'top',
                                },
                            },
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        tooltip: {
                            y: {
                                formatter: (value: number) => {
                                    return value.toString();
                                },
                            },
                        },
                    };
                    
                    chartSeries = [
                        {
                            name: 'Tổng tạo',
                            data: data.map((item: any) => item?.totalCreated || 0),
                        },
                        {
                            name: 'Đã hoàn thành',
                            data: data.map((item: any) => item?.totalCompleted || 0),
                        },
                        {
                            name: 'Đã hủy',
                            data: data.map((item: any) => item?.totalCancelled || 0),
                        },
                        {
                            name: 'Đang chờ',
                            data: data.map((item: any) => item?.totalPending || 0),
                        },
                    ];
                } else {
                    // Không có data array - hiển thị donut chart với summary
                    const bookingsData = ('currentPeriod' in reportData && reportData.currentPeriod) 
                        ? reportData.currentPeriod 
                        : (reportData || {});
                    
                    const totalCreated = bookingsData.totalCreated || 0;
                    const totalCompleted = bookingsData.totalCompleted || 0;
                    const totalCancelled = bookingsData.totalCancelled || 0;
                    const totalPending = bookingsData.totalPending || 0;
                    const totalConfirmed = bookingsData.totalConfirmed || 0;
                    const totalCheckedIn = bookingsData.totalCheckedIn || 0;
                    const totalRescheduled = bookingsData.totalRescheduled || 0;
                    
                    const otherStatuses = totalCreated - totalCompleted - totalCancelled - totalPending - totalConfirmed - totalCheckedIn - totalRescheduled;
                    
                    console.log('[PartnerReportsPage] renderChart: Processing bookings summary data', {
                        bookingsData,
                        totalCreated,
                        totalCompleted,
                        totalCancelled,
                    });
                    
                    const bookingStatusData: { label: string; value: number; color: string }[] = [];
                    
                    if (totalCompleted > 0) {
                        bookingStatusData.push({ label: 'Đã hoàn thành', value: totalCompleted, color: '#10b981' });
                    }
                    if (totalConfirmed > 0) {
                        bookingStatusData.push({ label: 'Đã xác nhận', value: totalConfirmed, color: '#3b82f6' });
                    }
                    if (totalCheckedIn > 0) {
                        bookingStatusData.push({ label: 'Đã check-in', value: totalCheckedIn, color: '#8b5cf6' });
                    }
                    if (totalPending > 0) {
                        bookingStatusData.push({ label: 'Đang chờ', value: totalPending, color: '#f59e0b' });
                    }
                    if (totalCancelled > 0) {
                        bookingStatusData.push({ label: 'Đã hủy', value: totalCancelled, color: '#ef4444' });
                    }
                    if (totalRescheduled > 0) {
                        bookingStatusData.push({ label: 'Đã đổi lịch', value: totalRescheduled, color: '#6366f1' });
                    }
                    if (otherStatuses > 0) {
                        bookingStatusData.push({ label: 'Khác', value: otherStatuses, color: '#6b7280' });
                    }
                    
                    if (bookingStatusData.length > 0) {
                        chartOptions = {
                            chart: { 
                                type: 'donut',
                                toolbar: { show: false },
                            },
                            labels: bookingStatusData.map(item => item.label),
                            colors: bookingStatusData.map(item => item.color),
                            legend: { 
                                position: 'bottom',
                                fontSize: '14px',
                            },
                            plotOptions: {
                                pie: {
                                    donut: {
                                        size: '60%',
                                        labels: {
                                            show: true,
                                            total: {
                                                show: true,
                                                label: 'Tổng đặt phòng',
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                formatter: () => totalCreated.toString(),
                                            },
                                        },
                                    },
                                },
                            },
                            tooltip: {
                                y: {
                                    formatter: (value: number) => {
                                        const percentage = totalCreated > 0 ? ((value / totalCreated) * 100).toFixed(1) : '0';
                                        return `${value} (${percentage}%)`;
                                    },
                                },
                            },
                        };
                        
                        chartSeries = bookingStatusData.map(item => item.value);
                    } else {
                        chartOptions = {
                            chart: { type: 'bar', toolbar: { show: false } },
                            xaxis: {
                                categories: ['Tổng tạo', 'Đã hoàn thành', 'Đã hủy'],
                            },
                            yaxis: { title: { text: 'Số lượng' } },
                            colors: ['#2563eb'],
                        };
                        chartSeries = [{
                            name: 'Số lượng',
                            data: [totalCreated, totalCompleted, totalCancelled],
                        }];
                    }
                }
                break;
            case 'rooms':
                // Rooms performance data là array
                if (reportData?.data && Array.isArray(reportData.data)) {
                    const data = reportData.data;
                    console.log('[PartnerReportsPage] renderChart: Processing rooms data', {
                        dataLength: data.length,
                    });
                    
                    // Lấy tên phòng làm categories
                    const categories = data.map((item: any) => item?.roomName || '');
                    
                    chartOptions = {
                        chart: { type: 'bar', toolbar: { show: false } },
                        xaxis: {
                            categories: categories,
                            labels: {
                                rotate: -45,
                                style: {
                                    fontSize: '11px',
                                },
                            },
                        },
                        yaxis: [
                            {
                                title: { text: 'Doanh thu (VND)' },
                                labels: {
                                    formatter: (value: number) => {
                                        if (value >= 1000000) {
                                            return (value / 1000000).toFixed(1) + 'M';
                                        } else if (value >= 1000) {
                                            return (value / 1000).toFixed(0) + 'K';
                                        }
                                        return value.toString();
                                    },
                                },
                            },
                            {
                                opposite: true,
                                title: { text: 'Số đêm đã đặt' },
                            },
                        ],
                        colors: ['#2563eb', '#10b981'],
                        legend: { position: 'top' },
                        plotOptions: {
                            bar: {
                                horizontal: false,
                                columnWidth: '55%',
                            },
                        },
                        tooltip: {
                            y: {
                                formatter: (value: number, { seriesIndex }: any) => {
                                    if (seriesIndex === 0) {
                                        return value.toLocaleString('vi-VN') + ' VND';
                                    } else {
                                        return value.toString() + ' đêm';
                                    }
                                },
                            },
                        },
                    };
                    
                    chartSeries = [
                        {
                            name: 'Doanh thu',
                            data: data.map((item: any) => item?.totalRevenue || 0),
                        },
                        {
                            name: 'Số đêm đã đặt',
                            data: data.map((item: any) => item?.totalBookedNights || 0),
                            yAxisIndex: 1, // Dùng yaxis thứ 2
                        },
                    ];
                } else {
                }
                break;
            case 'occupancy':
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    const currentData = Array.isArray(reportData.currentPeriod.data) 
                        ? reportData.currentPeriod.data 
                        : [];
                    const previousData = Array.isArray(reportData.previousPeriod?.data) 
                        ? reportData.previousPeriod.data 
                        : [];
                    chartOptions = {
                        chart: { type: 'area', toolbar: { show: false } },
                        xaxis: {
                            categories: currentData.map((item: any) => {
                                if (!item?.date) return '';
                                const date = new Date(item.date);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }),
                        },
                        yaxis: { title: { text: 'Tỷ lệ (%)' }, min: 0, max: 100 },
                        colors: ['#2563eb', '#10b981'],
                        legend: { position: 'top' },
                    };
                    chartSeries = [
                        {
                            name: 'Kỳ hiện tại',
                            data: currentData.map((item: any) => item?.occupancyRate || 0),
                        },
                        {
                            name: 'Kỳ trước',
                            data: previousData.map((item: any) => item?.occupancyRate || 0),
                        },
                    ];
                } else if (reportData?.data) {
                    const data = Array.isArray(reportData.data) ? reportData.data : [];
                    chartOptions = {
                        chart: { type: 'area', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => {
                                if (!item?.date) return '';
                                const date = new Date(item.date);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }),
                        },
                        yaxis: { title: { text: 'Tỷ lệ (%)' }, min: 0, max: 100 },
                        colors: ['#2563eb'],
                    };
                    chartSeries = [{
                        name: 'Tỷ lệ lấp đầy',
                        data: data.map((item: any) => item?.occupancyRate || 0),
                    }];
                }
                break;
            case 'customers':
                // Customer summary data có thể là object đơn hoặc có currentPeriod/previousPeriod
                // Nhưng nếu có customerDetails, tính lại từ đó để đảm bảo chính xác
                if (customerDetails && customerDetails.length > 0) {
                    // Tính từ customerDetails (dữ liệu thực tế từ bookings)
                    const newCustomers = customerDetails.filter((c: any) => c.isNewCustomer);
                    const returningCustomers = customerDetails.filter((c: any) => !c.isNewCustomer);
                    
                    const totalNewCustomerBookings = newCustomers.reduce((sum: number, c: any) => sum + (c.bookingCount || 0), 0);
                    const totalReturningCustomerBookings = returningCustomers.reduce((sum: number, c: any) => sum + (c.bookingCount || 0), 0);
                    const totalCompletedBookings = totalNewCustomerBookings + totalReturningCustomerBookings;
                    
                    const newCustomerPercentage = totalCompletedBookings > 0 
                        ? (totalNewCustomerBookings / totalCompletedBookings) * 100 
                        : 0;
                    const returningCustomerPercentage = totalCompletedBookings > 0 
                        ? (totalReturningCustomerBookings / totalCompletedBookings) * 100 
                        : 0;
                    
                    console.log('[PartnerReportsPage] renderChart: Processing customers data from customerDetails', {
                        totalCustomers: customerDetails.length,
                        newCustomers: newCustomers.length,
                        returningCustomers: returningCustomers.length,
                        newCustomerPercentage,
                        returningCustomerPercentage,
                        totalNewCustomerBookings,
                        totalReturningCustomerBookings,
                        totalCompletedBookings,
                    });
                    
                    // Tạo donut chart để hiển thị tỷ lệ
                    chartOptions = {
                        chart: { type: 'donut', toolbar: { show: false } },
                        labels: ['Khách hàng mới', 'Khách hàng quay lại'],
                        colors: ['#2563eb', '#10b981'],
                        legend: { position: 'bottom' },
                        plotOptions: {
                            pie: {
                                donut: {
                                    size: '70%',
                                    labels: {
                                        show: true,
                                        total: {
                                            show: true,
                                            label: 'Tổng đặt phòng',
                                            formatter: () => totalCompletedBookings.toString(),
                                        },
                                    },
                                },
                            },
                        },
                        tooltip: {
                            y: {
                                formatter: (value: number, { seriesIndex }: any) => {
                                    if (seriesIndex === 0) {
                                        return `${value.toFixed(2)}% (${totalNewCustomerBookings} đặt phòng)`;
                                    } else {
                                        return `${value.toFixed(2)}% (${totalReturningCustomerBookings} đặt phòng)`;
                                    }
                                },
                            },
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: (val: number) => val.toFixed(1) + '%',
                        },
                    };
                    
                    chartSeries = [
                        newCustomerPercentage,
                        returningCustomerPercentage,
                    ];
                } else if (reportData) {
                    // Fallback: dùng data từ API
                    let customerData: any;
                    
                    // Kiểm tra xem có currentPeriod không (comparison mode)
                    if ('currentPeriod' in reportData && reportData.currentPeriod) {
                        customerData = reportData.currentPeriod;
                    } else {
                        customerData = reportData;
                    }
                    
                    const newCustomerPercentage = customerData.newCustomerPercentage || 0;
                    const returningCustomerPercentage = customerData.returningCustomerPercentage || 0;
                    const totalNewCustomerBookings = customerData.totalNewCustomerBookings || 0;
                    const totalReturningCustomerBookings = customerData.totalReturningCustomerBookings || 0;
                    const totalCompletedBookings = customerData.totalCompletedBookings || 0;
                    
                    console.log('[PartnerReportsPage] renderChart: Processing customers data from API', {
                        newCustomerPercentage,
                        returningCustomerPercentage,
                        totalNewCustomerBookings,
                        totalReturningCustomerBookings,
                        totalCompletedBookings,
                    });
                    
                    // Tạo donut chart để hiển thị tỷ lệ
                    chartOptions = {
                        chart: { type: 'donut', toolbar: { show: false } },
                        labels: ['Khách hàng mới', 'Khách hàng quay lại'],
                        colors: ['#2563eb', '#10b981'],
                        legend: { position: 'bottom' },
                        plotOptions: {
                            pie: {
                                donut: {
                                    size: '70%',
                                    labels: {
                                        show: true,
                                        total: {
                                            show: true,
                                            label: 'Tổng đặt phòng',
                                            formatter: () => totalCompletedBookings.toString(),
                                        },
                                    },
                                },
                            },
                        },
                        tooltip: {
                            y: {
                                formatter: (value: number, { seriesIndex }: any) => {
                                    if (seriesIndex === 0) {
                                        return `${value.toFixed(2)}% (${totalNewCustomerBookings} đặt phòng)`;
                                    } else {
                                        return `${value.toFixed(2)}% (${totalReturningCustomerBookings} đặt phòng)`;
                                    }
                                },
                            },
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: (val: number) => val.toFixed(1) + '%',
                        },
                    };
                    
                    chartSeries = [
                        newCustomerPercentage,
                        returningCustomerPercentage,
                    ];
                } else {
                }
                break;
        }

        if (!chartOptions) {
            console.warn('[PartnerReportsPage] renderChart: No chartOptions created', {
                activeTab,
                reportDataKeys: reportData ? Object.keys(reportData) : [],
            });
            return (
                <div className="alert alert-warning">
                    <p>Không thể tạo biểu đồ. Vui lòng kiểm tra dữ liệu.</p>
                    <details className="mt-2">
                        <summary className="cursor-pointer text-sm">Chi tiết (click để xem)</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify({ activeTab, reportData }, null, 2)}
                        </pre>
                    </details>
                </div>
            );
        }

        const chartType = chartOptions.chart?.type;
        const isDonutOrPieChart = chartType === 'donut' || chartType === 'pie';
        
        console.log('[PartnerReportsPage] renderChart: Rendering chart', {
            chartType,
            isDonutOrPieChart,
            seriesCount: chartSeries.length,
            seriesDataLength: chartSeries[0]?.data?.length || 0,
            categoriesLength: chartOptions.xaxis?.categories?.length || 0,
            categories: chartOptions.xaxis?.categories,
            seriesData: chartSeries[0]?.data,
            chartSeries,
        });

        // Kiểm tra dữ liệu: donut/pie chart dùng mảng số, line/bar chart dùng mảng object có data
        let hasValidData = false;
        
        if (isDonutOrPieChart) {
            // Donut/Pie chart: chartSeries là mảng số trực tiếp
            // Luôn cho phép hiển thị nếu có chartSeries (kể cả khi tổng = 0)
            hasValidData = Array.isArray(chartSeries) && chartSeries.length > 0;
        } else {
            // Line/Bar chart: chartSeries là mảng object có data property
            hasValidData = chartSeries.length > 0 
                && chartSeries[0]?.data 
                && Array.isArray(chartSeries[0].data) 
                && chartSeries[0].data.length > 0;
        }

        if (!hasValidData) {
            return (
                <div className="alert alert-warning text-center py-4">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Không có dữ liệu để hiển thị biểu đồ.</strong>
                </div>
            );
        }

        const chartTitle = activeTab === 'revenue' 
            ? 'Biểu đồ doanh thu'
            : activeTab === 'bookings'
            ? 'Biểu đồ đặt phòng'
            : activeTab === 'occupancy'
            ? 'Biểu đồ tỷ lệ lấp đầy'
            : activeTab === 'rooms'
            ? 'Biểu đồ hiệu suất phòng'
            : activeTab === 'customers'
            ? 'Biểu đồ khách hàng'
            : 'Biểu đồ';

        return (
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">{chartTitle}</h5>
                    <Chart 
                        options={chartOptions} 
                        series={chartSeries} 
                        type={chartOptions.chart?.type || 'line'} 
                        height={350} 
                    />
                </div>
            </div>
        );
    };

    const renderReportContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-danger" role="alert">
                    <h5>Lỗi khi tải báo cáo:</h5>
                    <p>{error}</p>
                    <details className="mt-2">
                        <summary className="cursor-pointer text-sm">Chi tiết lỗi (click để xem)</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify({ activeTab, selectedHotelId, dateRange, error }, null, 2)}
                        </pre>
                    </details>
                </div>
            );
        }

        if (!reportData) {
            return (
                <div className="alert alert-info" role="alert">
                    <p>Chọn khách sạn và khoảng thời gian để xem báo cáo.</p>
                    {selectedHotelId && dateRange.from && dateRange.to && (
                        <p className="mt-2 text-sm">
                            Đang chờ dữ liệu... (Hotel: {selectedHotelId}, Từ: {dateRange.from}, Đến: {dateRange.to})
                        </p>
                    )}
                </div>
            );
        }
        
        // Debug: Log data structure
        console.log('[PartnerReportsPage] Rendering report with data:', {
            activeTab,
            hasData: !!reportData,
            dataType: typeof reportData,
            isArray: Array.isArray(reportData),
            dataKeys: reportData ? Object.keys(reportData) : [],
            hasCurrentPeriod: 'currentPeriod' in reportData,
            hasData: 'data' in reportData,
        });

        return (
            <div>
                {/* Summary Cards */}
                {activeTab === 'revenue' && (() => {
                    const summary = ('currentPeriod' in reportData && reportData.currentPeriod?.summary) 
                        ? reportData.currentPeriod.summary 
                        : (reportData?.summary);
                    
                    return summary ? (
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <div className="card bg-primary text-white">
                                    <div className="card-body">
                                        <h6 className="card-title">Tổng doanh thu</h6>
                                        <h3 className="mb-0">
                                            {(summary.totalRevenue || 0).toLocaleString('vi-VN')} VND
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null;
                })()}
                
                {renderChart()}
                
                <div className="mt-4">
                    <h5>Chi tiết dữ liệu</h5>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    {activeTab === 'revenue' && (
                                        <>
                                            <th>Kỳ</th>
                                            <th>Doanh thu</th>
                                        </>
                                    )}
                                    {activeTab === 'bookings' && (
                                        reportData?.data && Array.isArray(reportData.data) ? (
                                            <>
                                                <th>Kỳ</th>
                                                <th>Tổng tạo</th>
                                                <th>Đã hoàn thành</th>
                                                <th>Đã hủy</th>
                                                <th>Đang chờ</th>
                                                <th>Tỷ lệ hủy (%)</th>
                                            </>
                                        ) : (
                                            <>
                                                <th>Chỉ số</th>
                                                <th>Giá trị</th>
                                            </>
                                        )
                                    )}
                                    {activeTab === 'occupancy' && (
                                        <>
                                            <th>Ngày</th>
                                            <th>Tỷ lệ lấp đầy (%)</th>
                                        </>
                                    )}
                                    {activeTab === 'rooms' && (
                                        <>
                                            <th>Tên phòng</th>
                                            <th>View</th>
                                            <th>Doanh thu</th>
                                            <th>Số đêm đã đặt</th>
                                        </>
                                    )}
                                    {activeTab === 'customers' && (
                                        <>
                                            <th>Tên khách hàng</th>
                                            <th>Email</th>
                                            <th>Số điện thoại</th>
                                            <th>Số lần đặt phòng</th>
                                            <th>Tổng tiền</th>
                                            <th>Loại</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'revenue' && (() => {
                                    let dataArray: any[] = [];
                                    if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                                        dataArray = Array.isArray(reportData.currentPeriod.data) 
                                            ? reportData.currentPeriod.data 
                                            : [];
                                    } else if (reportData?.data) {
                                        dataArray = Array.isArray(reportData.data) 
                                            ? reportData.data 
                                            : [];
                                    }
                                    
                                    return (
                                        <>
                                            {dataArray.map((item: any, index: number) => (
                                                <tr key={index}>
                                                    <td>{item?.period || ''}</td>
                                                    <td>{(item?.revenue || 0).toLocaleString('vi-VN')} VND</td>
                                                </tr>
                                            ))}
                                        </>
                                    );
                                })()}
                                {activeTab === 'bookings' && (() => {
                                    // Kiểm tra xem có data array (theo groupBy) hay chỉ là summary object
                                    if (reportData?.data && Array.isArray(reportData.data)) {
                                        // Có data array - hiển thị theo groupBy
                                        const data = reportData.data;
                                        
                                        // Format period labels
                                        const formatPeriodLabel = (period: string) => {
                                            if (!period) return '';
                                            try {
                                                const date = new Date(period);
                                                if (isNaN(date.getTime())) return period;
                                                
                                                if (groupBy === 'day') {
                                                    return date.toLocaleDateString('vi-VN');
                                                } else if (groupBy === 'week') {
                                                    const weekEnd = new Date(date);
                                                    weekEnd.setDate(date.getDate() + 6);
                                                    return `${date.toLocaleDateString('vi-VN')} - ${weekEnd.toLocaleDateString('vi-VN')}`;
                                                } else if (groupBy === 'month') {
                                                    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
                                                } else if (groupBy === 'quarter') {
                                                    if (period.includes('Q')) {
                                                        return period.replace('-Q', ' Q');
                                                    }
                                                    const quarter = Math.floor(date.getMonth() / 3) + 1;
                                                    return `Q${quarter} ${date.getFullYear()}`;
                                                } else if (groupBy === 'year') {
                                                    if (period.match(/^\d{4}$/)) {
                                                        return period;
                                                    }
                                                    return date.getFullYear().toString();
                                                }
                                            } catch (e) {
                                            }
                                            return period;
                                        };
                                        
                                        return (
                                            <>
                                                {data.map((item: any, index: number) => (
                                                    <tr key={index}>
                                                        <td>{formatPeriodLabel(item?.period || '')}</td>
                                                        <td>{(item?.totalCreated || 0).toLocaleString('vi-VN')}</td>
                                                        <td>{(item?.totalCompleted || 0).toLocaleString('vi-VN')}</td>
                                                        <td>{(item?.totalCancelled || 0).toLocaleString('vi-VN')}</td>
                                                        <td>{(item?.totalPending || 0).toLocaleString('vi-VN')}</td>
                                                        <td>{((item?.cancellationRate || 0)).toFixed(2)}%</td>
                                                    </tr>
                                                ))}
                                            </>
                                        );
                                    } else {
                                        // Không có data array - hiển thị summary object
                                        const bookingsData = ('currentPeriod' in reportData && reportData.currentPeriod) 
                                            ? reportData.currentPeriod 
                                            : (reportData || {});
                                        
                                        // Flatten nested objects
                                        const flattened: { [key: string]: any } = {};
                                        Object.entries(bookingsData).forEach(([key, value]) => {
                                            if (value && typeof value === 'object' && !Array.isArray(value)) {
                                                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                                                    flattened[`${key}.${nestedKey}`] = nestedValue;
                                                });
                                            } else {
                                                flattened[key] = value;
                                            }
                                        });
                                        
                                        return (
                                            <>
                                                {Object.entries(flattened).map(([key, value]: [string, any]) => (
                                                    <tr key={key}>
                                                        <td>{key}</td>
                                                        <td>
                                                            {typeof value === 'number' 
                                                                ? value.toLocaleString('vi-VN') 
                                                                : (typeof value === 'object' 
                                                                    ? JSON.stringify(value) 
                                                                    : (value || ''))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        );
                                    }
                                })()}
                                {activeTab === 'occupancy' && (() => {
                                    let dataArray: any[] = [];
                                    if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                                        dataArray = Array.isArray(reportData.currentPeriod.data) 
                                            ? reportData.currentPeriod.data 
                                            : [];
                                    } else if (reportData?.data) {
                                        dataArray = Array.isArray(reportData.data) 
                                            ? reportData.data 
                                            : [];
                                    }
                                    
                                    return (
                                        <>
                                            {dataArray.map((item: any, index: number) => (
                                                <tr key={index}>
                                                    <td>{item?.date ? new Date(item.date).toLocaleDateString('vi-VN') : ''}</td>
                                                    <td>{(item?.occupancyRate || 0).toFixed(2)}%</td>
                                                </tr>
                                            ))}
                                        </>
                                    );
                                })()}
                                {activeTab === 'rooms' && 'data' in reportData && (reportData.data || []).map((item: any, index: number) => (
                                    <tr key={index}>
                                        <td>{item?.roomName || ''}</td>
                                        <td>{item?.roomView || ''}</td>
                                        <td>{(item?.totalRevenue || item?.currentPeriod?.totalRevenue || 0).toLocaleString('vi-VN')} VND</td>
                                        <td>{item?.totalBookedNights || item?.currentPeriod?.totalBookedNights || 0}</td>
                                    </tr>
                                ))}
                                {activeTab === 'customers' && customerDetails.length > 0 && customerDetails.map((customer: any, index: number) => (
                                    <tr key={index}>
                                        <td>{customer?.customerName || 'N/A'}</td>
                                        <td>{customer?.email || 'N/A'}</td>
                                        <td>{customer?.phone || 'N/A'}</td>
                                        <td>{customer?.bookingCount || 0}</td>
                                        <td>{(customer?.totalAmount || 0).toLocaleString('vi-VN')} VND</td>
                                        <td>
                                            <span className={`badge ${customer?.isNewCustomer ? 'bg-primary' : 'bg-success'}`}>
                                                {customer?.isNewCustomer ? 'Khách hàng mới' : 'Khách hàng quay lại'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'customers' && customerDetails.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted">
                                            Không có dữ liệu khách hàng
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-4 text-dark">Báo cáo</h1>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Khách sạn</label>
                            <select
                                className="form-select"
                                value={selectedHotelId}
                                onChange={(e) => setSelectedHotelId(e.target.value)}
                            >
                                <option value="">Chọn khách sạn</option>
                                {hotels.map((hotel) => (
                                    <option key={hotel.id} value={hotel.id}>
                                        {hotel.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Từ ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.from}
                                onChange={(e) => {
                                    const newFrom = e.target.value;
                                    setDateRange({ ...dateRange, from: newFrom });
                                    setReloadKey(prev => prev + 1); // Force reload
                                }}
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Đến ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.to}
                                onChange={(e) => {
                                    const newTo = e.target.value;
                                    setDateRange({ ...dateRange, to: newTo });
                                    setReloadKey(prev => prev + 1); // Force reload
                                }}
                            />
                        </div>
                        {(activeTab === 'revenue' || activeTab === 'occupancy' || activeTab === 'bookings') && (
                            <div className="col-md-2">
                                <label className="form-label">Nhóm theo</label>
                                <select
                                    className="form-select"
                                    value={groupBy}
                                    onChange={(e) => {
                                        const newGroupBy = e.target.value as 'day' | 'week' | 'month' | 'quarter' | 'year';
                                        setGroupBy(newGroupBy);
                                        setReloadKey(prev => prev + 1); // Force reload
                                    }}
                                >
                                    <option value="day">Ngày</option>
                                    <option value="week">Tuần</option>
                                    <option value="month">Tháng</option>
                                    <option value="quarter">Quý</option>
                                    <option value="year">Năm</option>
                                </select>
                            </div>
                        )}
                        <div className="col-md-3 d-flex align-items-end">
                            <button
                                className="btn btn-primary me-2"
                                onClick={exportToExcel}
                                disabled={!reportData}
                            >
                                <i className="bi bi-file-earmark-excel me-2"></i>
                                Xuất Excel
                            </button>
                        </div>
                    </div>
                    <div className="row g-3 mt-2">
                        <div className="col-md-12">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="compareCheck"
                                    checked={compareEnabled}
                                    onChange={(e) => setCompareEnabled(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="compareCheck">
                                    So sánh với kỳ trước
                                </label>
                            </div>
                        </div>
                        {compareEnabled && (
                            <>
                                <div className="col-md-3">
                                    <label className="form-label">Từ ngày (kỳ trước)</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={compareDateRange.from}
                                        onChange={(e) => setCompareDateRange({ ...compareDateRange, from: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Đến ngày (kỳ trước)</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={compareDateRange.to}
                                        onChange={(e) => setCompareDateRange({ ...compareDateRange, to: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'revenue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        Doanh thu
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        Đặt phòng
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'occupancy' ? 'active' : ''}`}
                        onClick={() => setActiveTab('occupancy')}
                    >
                        Tỷ lệ lấp đầy
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rooms')}
                    >
                        Hiệu suất phòng
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customers')}
                    >
                        Khách hàng
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Đánh giá
                    </button>
                </li>
            </ul>

            {/* Report Content */}
            <div className="card">
                <div className="card-body">
                    {renderReportContent()}
                </div>
            </div>
        </div>
    );
}

