"use client";
import { useEffect, useState } from 'react';
import {
    getAdminRevenueReport,
    getAdminHotelPerformanceReport,
    getAdminUsersSummaryReport,
    getAdminSeasonalityReport,
    getAdminPopularLocationsReport,
    getAdminPopularRoomTypesReport,
    getAdminFinancialsReport,
} from '@/lib/Super_Admin/superAdminReportsService';
import { getHotelAdmins } from '@/lib/Super_Admin/hotelAdminService';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type ReportType = 'revenue' | 'hotels' | 'users' | 'seasonality' | 'locations' | 'rooms' | 'financials';

export default function SuperAdminReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportType>('revenue');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
    const [compareEnabled, setCompareEnabled] = useState(false);
    const [compareDateRange, setCompareDateRange] = useState({ from: '', to: '' });
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metric, setMetric] = useState<'revenue' | 'bookings'>('revenue');
    const [level, setLevel] = useState<'city' | 'province'>('city');
    const [hotelPartnerMap, setHotelPartnerMap] = useState<Map<string, { name: string; email: string }>>(new Map());
    const [filterType, setFilterType] = useState<'custom' | 'quarter' | 'month' | 'year'>('month');
    const [selectedQuarter, setSelectedQuarter] = useState<{ quarter: number; year: number }>({ 
        quarter: Math.floor(new Date().getMonth() / 3) + 1, 
        year: new Date().getFullYear() 
    });
    const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number }>({ 
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear() 
    });
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Initialize dates - Mặc định hiển thị tháng hiện tại
    useEffect(() => {
        const today = new Date();
        const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        setDateRange({
            from: firstDayThisMonth.toISOString().split('T')[0],
            to: lastDayThisMonth.toISOString().split('T')[0],
        });
        
        // Kỳ so sánh: tháng trước
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        
        setCompareDateRange({
            from: firstDayLastMonth.toISOString().split('T')[0],
            to: lastDayLastMonth.toISOString().split('T')[0],
        });
    }, []);

    // Auto-adjust groupBy based on filter type
    useEffect(() => {
        if (filterType === 'custom') return;

        if (filterType === 'quarter' && groupBy === 'day') {
            setGroupBy('week');
        } else if (filterType === 'month' && groupBy === 'month') {
            setGroupBy('day');
        } else if (filterType === 'year' && groupBy !== 'month') {
            setGroupBy('month');
        }
    }, [filterType]); // Chỉ chạy khi filterType thay đổi

    // Update date range based on filter type
    useEffect(() => {
        if (filterType === 'custom') return;

        let fromDate: Date;
        let toDate: Date;

        if (filterType === 'quarter') {
            // Quý 1: tháng 0-2 (Jan-Mar), Quý 2: tháng 3-5 (Apr-Jun), Quý 3: tháng 6-8 (Jul-Sep), Quý 4: tháng 9-11 (Oct-Dec)
            const startMonth = (selectedQuarter.quarter - 1) * 3; // 0, 3, 6, 9
            fromDate = new Date(selectedQuarter.year, startMonth, 1); // Ngày đầu tháng đầu quý
            // Ngày cuối tháng cuối quý: tháng startMonth + 2, ngày 0 của tháng tiếp theo
            toDate = new Date(selectedQuarter.year, startMonth + 3, 0); // Ngày cuối tháng cuối quý
        } else if (filterType === 'month') {
            fromDate = new Date(selectedMonth.year, selectedMonth.month - 1, 1);
            toDate = new Date(selectedMonth.year, selectedMonth.month, 0);
        } else if (filterType === 'year') {
            fromDate = new Date(selectedYear, 0, 1);
            toDate = new Date(selectedYear, 11, 31);
        } else {
            return;
        }

        const fromStr = fromDate.toISOString().split('T')[0];
        const toStr = toDate.toISOString().split('T')[0];
        
        console.log('[SuperAdminReports] Updating date range:', {
            filterType,
            fromDate: fromStr,
            toDate: toStr,
            selectedQuarter,
            selectedMonth,
            selectedYear,
            groupBy
        });

        setDateRange({
            from: fromStr,
            to: toStr,
        });
    }, [filterType, selectedQuarter, selectedMonth, selectedYear]);

    // Load hotel-partner mapping
    useEffect(() => {
        const loadHotelPartnerMap = async () => {
            try {
                const map = new Map<string, { name: string; email: string }>();
                
                // Bước 1: Lấy tất cả users với role PARTNER
                try {
                    const adminsResponse = await getHotelAdmins({ page: 1, limit: 1000 });
                    const admins = adminsResponse.data || [];
                    
                    console.log('[SuperAdminReports] Loaded hotel admins:', admins.length);
                    
                    // Tạo map userId -> {name, email} cho partners
                    const partnerMap = new Map<string, { name: string; email: string }>();
                    admins.forEach((admin: any) => {
                        const displayName = admin.username || admin.fullName || admin.name || admin.email || 'N/A';
                        partnerMap.set(admin.userId || admin.id, {
                            name: displayName,
                            email: admin.email || 'N/A',
                        });
                    });
                    
                    // Bước 2: Lấy tất cả hotels và map với partnerId
                    try {
                        const hotelsResponse = await getHotels(0, 1000, undefined, undefined, undefined, undefined);
                        const hotels = hotelsResponse.hotels || [];
                        
                        console.log('[SuperAdminReports] Loaded hotels:', hotels.length);
                        
                        // Map hotels với partner info
                        for (const hotel of hotels) {
                            // Ưu tiên dùng ownerId từ hotel object
                            if (hotel.ownerId) {
                                const partnerInfo = partnerMap.get(hotel.ownerId);
                                if (partnerInfo) {
                                    map.set(hotel.id, partnerInfo);
                                    continue;
                                }
                            }
                            
                            // Nếu hotel có ownerName/ownerEmail, dùng luôn
                            if (hotel.ownerName || hotel.ownerEmail) {
                                map.set(hotel.id, {
                                    name: hotel.ownerName || 'N/A',
                                    email: hotel.ownerEmail || 'N/A',
                                });
                                continue;
                            }
                            
                            // Nếu không có ownerId trong hotel object, thử fetch detail
                            // (chỉ fetch nếu chưa có trong map và hotel có id)
                            if (hotel.id && !map.has(hotel.id)) {
                                try {
                                    // Import getHotelById dynamically để tránh circular dependency
                                    const { getHotelById } = await import('@/lib/AdminAPI/hotelService');
                                    const hotelDetail = await getHotelById(hotel.id);
                                    
                                    if (hotelDetail?.ownerId) {
                                        const partnerInfo = partnerMap.get(hotelDetail.ownerId);
                                        if (partnerInfo) {
                                            map.set(hotel.id, partnerInfo);
                                        } else if (hotelDetail.ownerName || hotelDetail.ownerEmail) {
                                            map.set(hotel.id, {
                                                name: hotelDetail.ownerName || 'N/A',
                                                email: hotelDetail.ownerEmail || 'N/A',
                                            });
                                        }
                                    }
                                } catch (detailErr) {
                                    // Ignore error khi fetch detail
                                    console.warn(`[SuperAdminReports] Could not fetch detail for hotel ${hotel.id}:`, detailErr);
                                }
                            }
                        }
                    } catch (err) {
                        console.warn('[SuperAdminReports] Error loading hotels:', err);
                    }
                } catch (err) {
                    console.warn('[SuperAdminReports] Error loading hotel admins:', err);
                    
                    // Fallback: thử lấy từ hotels trực tiếp
                    try {
                        const hotelsResponse = await getHotels(0, 1000, undefined, undefined, undefined, undefined);
                        const hotels = hotelsResponse.hotels || [];
                        
                        hotels.forEach((hotel: any) => {
                            if (hotel.ownerId && (hotel.ownerName || hotel.ownerEmail)) {
                                map.set(hotel.id, {
                                    name: hotel.ownerName || 'N/A',
                                    email: hotel.ownerEmail || 'N/A',
                                });
                            }
                        });
                    } catch (fallbackErr) {
                        console.warn('[SuperAdminReports] Error in fallback loading:', fallbackErr);
                    }
                }
                
                console.log('[SuperAdminReports] Hotel-partner map loaded:', map.size, 'hotels');
                setHotelPartnerMap(map);
            } catch (err) {
                console.warn('[SuperAdminReports] Error loading hotel-partner map:', err);
            }
        };
        
        loadHotelPartnerMap();
    }, []);

    // Load report data
    useEffect(() => {
        if (!dateRange.from || !dateRange.to) return;

        const loadReport = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let data: any;

                const compareParams = compareEnabled && compareDateRange.from && compareDateRange.to
                    ? { compareFrom: compareDateRange.from, compareTo: compareDateRange.to }
                    : {};

                switch (activeTab) {
                    case 'revenue':
                        // Lấy doanh thu tổng hợp TẤT CẢ khách sạn (không filter)
                        // filterBy = undefined để lấy từ SystemDailyReport (tổng hợp tất cả)
                        console.log('[SuperAdminReports] Fetching revenue report:', {
                            from: dateRange.from,
                            to: dateRange.to,
                            groupBy,
                            filterBy: undefined, // Không filter = lấy TẤT CẢ
                            compareParams
                        });
                        
                        try {
                            data = await getAdminRevenueReport(
                                dateRange.from,
                                dateRange.to,
                                groupBy,
                                undefined, // QUAN TRỌNG: undefined = lấy TẤT CẢ khách sạn từ SystemDailyReport
                                0,
                                1000,
                                compareParams.compareFrom,
                                compareParams.compareTo
                            );
                            
                            // Nếu SystemDailyReport thiếu data, tính tổng từ Hotel Performance làm fallback
                            const dataArray = ('currentPeriod' in data && data.currentPeriod?.data)
                                ? data.currentPeriod.data
                                : (data?.data || []);
                            const summary = ('currentPeriod' in data && data.currentPeriod?.summary)
                                ? data.currentPeriod.summary
                                : data?.summary;
                            
                            // Tính expected data points
                            const fromDateObj = new Date(dateRange.from);
                            const toDateObj = new Date(dateRange.to);
                            let expectedDataPoints: number;
                            if (groupBy === 'month') {
                                const fromYear = fromDateObj.getFullYear();
                                const fromMonth = fromDateObj.getMonth();
                                const toYear = toDateObj.getFullYear();
                                const toMonth = toDateObj.getMonth();
                                expectedDataPoints = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
                            } else if (groupBy === 'week') {
                                const daysDiff = Math.ceil((toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                expectedDataPoints = Math.ceil(daysDiff / 7);
                            } else {
                                const daysDiff = Math.ceil((toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                expectedDataPoints = daysDiff;
                            }
                            
                            const dataCompleteness = dataArray.length / expectedDataPoints;
                            
                            // Nếu data completeness < 30%, thử tính tổng từ Hotel Performance report
                            if (dataCompleteness < 0.3 && (summary?.totalRevenue || 0) < 10000000) {
                                console.log('[SuperAdminReports] SystemDailyReport data incomplete, fetching from Hotel Performance as fallback...');
                                try {
                                    const hotelPerformanceData = await getAdminHotelPerformanceReport(
                                        dateRange.from,
                                        dateRange.to,
                                        'revenue',
                                        'desc',
                                        undefined,
                                        undefined,
                                        0,
                                        1000, // Lấy tất cả hotels
                                        undefined,
                                        undefined
                                    );
                                    
                                    const hotelsData = ('currentPeriod' in hotelPerformanceData && hotelPerformanceData.currentPeriod?.data)
                                        ? hotelPerformanceData.currentPeriod.data
                                        : (hotelPerformanceData?.data || []);
                                    
                                    // Tính tổng từ tất cả hotels
                                    const totalFromHotels = hotelsData.reduce((sum: number, hotel: any) => {
                                        return sum + (hotel?.totalRevenue || 0);
                                    }, 0);
                                    
                                    console.log('[SuperAdminReports] Fallback calculation from Hotel Performance:', {
                                        systemDailyReportTotal: summary?.totalRevenue || 0,
                                        hotelPerformanceTotal: totalFromHotels,
                                        numberOfHotels: hotelsData.length,
                                        usingFallback: totalFromHotels > (summary?.totalRevenue || 0) * 1.2
                                    });
                                    
                                    // Nếu tổng từ Hotel Performance lớn hơn nhiều, cập nhật summary
                                    if (totalFromHotels > (summary?.totalRevenue || 0) * 1.2) {
                                        // Cập nhật summary với tổng từ Hotel Performance
                                        if ('currentPeriod' in data && data.currentPeriod) {
                                            data.currentPeriod.summary.totalRevenue = totalFromHotels;
                                        } else if (data?.summary) {
                                            data.summary.totalRevenue = totalFromHotels;
                                        }
                                        console.log('[SuperAdminReports] Updated total revenue from Hotel Performance:', totalFromHotels);
                                    }
                                } catch (fallbackErr) {
                                    console.warn('[SuperAdminReports] Error fetching Hotel Performance fallback:', fallbackErr);
                                }
                            }
                        } catch (revenueErr) {
                            throw revenueErr;
                        }
                        
                        // Lấy lại data sau khi có thể đã được cập nhật bởi fallback
                        const dataArray = ('currentPeriod' in data && data.currentPeriod?.data)
                            ? data.currentPeriod.data
                            : (data?.data || []);
                        const summary = ('currentPeriod' in data && data.currentPeriod?.summary)
                            ? data.currentPeriod.summary
                            : data?.summary;
                        const totalRevenue = summary?.totalRevenue || 0;
                        
                        // Tính số data points kỳ vọng dựa trên groupBy (đã tính ở trên)
                        const fromDateObj = new Date(dateRange.from);
                        const toDateObj = new Date(dateRange.to);
                        let expectedDataPoints: number;
                        
                        if (groupBy === 'month') {
                            const fromYear = fromDateObj.getFullYear();
                            const fromMonth = fromDateObj.getMonth();
                            const toYear = toDateObj.getFullYear();
                            const toMonth = toDateObj.getMonth();
                            expectedDataPoints = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
                        } else if (groupBy === 'week') {
                            const daysDiff = Math.ceil((toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                            expectedDataPoints = Math.ceil(daysDiff / 7);
                        } else {
                            const daysDiff = Math.ceil((toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                            expectedDataPoints = daysDiff;
                        }
                        
                        const dataCompleteness = dataArray.length / expectedDataPoints;
                        
                        console.log('[SuperAdminReports] Revenue report received:', {
                            hasData: !!data,
                            dataType: typeof data,
                            dataKeys: data ? Object.keys(data) : [],
                            summary: summary,
                            totalRevenue: totalRevenue,
                            dataLength: dataArray.length,
                            groupBy: groupBy,
                            expectedDataPoints: expectedDataPoints,
                            completeness: (dataCompleteness * 100).toFixed(1) + '%',
                            dateRange: dateRange,
                            sampleData: dataArray.slice(0, 3),
                            fullData: data
                        });
                        
                        break;
                    case 'hotels':
                        data = await getAdminHotelPerformanceReport(
                            dateRange.from,
                            dateRange.to,
                            'revenue',
                            'desc',
                            undefined,
                            undefined,
                            0,
                            100, // Lấy nhiều hơn để hiển thị
                            compareParams.compareFrom,
                            compareParams.compareTo
                        );
                        break;
                    case 'users':
                        data = await getAdminUsersSummaryReport(
                            dateRange.from,
                            dateRange.to,
                            compareParams.compareFrom,
                            compareParams.compareTo
                        );
                        break;
                    case 'seasonality':
                        data = await getAdminSeasonalityReport(
                            dateRange.from,
                            dateRange.to,
                            metric
                        );
                        break;
                    case 'locations':
                        data = await getAdminPopularLocationsReport(
                            dateRange.from,
                            dateRange.to,
                            level,
                            metric,
                            20
                        );
                        break;
                    case 'rooms':
                        data = await getAdminPopularRoomTypesReport(
                            dateRange.from,
                            dateRange.to,
                            'occupancy',
                            20
                        );
                        break;
                    case 'financials':
                        data = await getAdminFinancialsReport(
                            dateRange.from,
                            dateRange.to,
                            groupBy,
                            compareParams.compareFrom,
                            compareParams.compareTo
                        );
                        break;
                }

                // Log tổng hợp cho tất cả tabs
                if (activeTab !== 'revenue') {
                    console.log('[SuperAdminReports] Data received:', {
                        activeTab,
                        dateRange,
                        hasData: !!data,
                        dataType: typeof data,
                        dataKeys: data ? Object.keys(data) : [],
                        dataLength: data?.data?.length || (data?.currentPeriod?.data?.length || 0),
                        sampleData: data?.data?.[0] || data?.currentPeriod?.data?.[0]
                    });
                }

                setReportData(data);
            } catch (err: any) {
                console.error('[SuperAdminReportsPage] Error loading report:', err);
                setError(err.response?.data?.message || 'Không thể tải báo cáo');
            } finally {
                setIsLoading(false);
            }
        };

        loadReport();
    }, [activeTab, dateRange, groupBy, compareEnabled, compareDateRange, metric, level]);

    const formatMoney = (value: number): string => {
        if (value >= 1_000_000_000) {
            return `${(value / 1_000_000_000).toFixed(2)} tỷ`;
        } else if (value >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(1)} triệu`;
        } else if (value >= 1_000) {
            return `${(value / 1_000).toFixed(0)} nghìn`;
        }
        return value.toLocaleString('en-US');
    };

    const exportToExcel = async () => {
        if (!reportData) return;
        
        const XLSX = await import('xlsx');
        let worksheetData: any[] = [];

        switch (activeTab) {
            case 'revenue':
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    worksheetData = (reportData.currentPeriod.data || []).map((item: any) => ({
                        'Kỳ': item.period || '',
                        'Doanh thu (VND)': item.revenue || 0,
                    }));
                } else if (reportData?.data) {
                    worksheetData = (reportData.data || []).map((item: any) => ({
                        'Kỳ': item.period || '',
                        'Doanh thu (VND)': item.revenue || 0,
                    }));
                }
                break;
            case 'hotels':
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    worksheetData = (reportData.currentPeriod.data || []).map((item: any) => {
                        const partnerInfo = hotelPartnerMap.get(item?.hotelId || '');
                        return {
                            'Tên khách sạn': item.hotelName || '',
                            'Admin khách sạn': partnerInfo?.name || 'N/A',
                            'Email': partnerInfo?.email || 'N/A',
                            'Doanh thu (VND)': item.totalRevenue || 0,
                            'Đặt phòng hoàn thành': item.totalCompletedBookings || 0,
                            'Đặt phòng đã tạo': item.totalCreatedBookings || 0,
                            'Đặt phòng đã hủy': item.totalCancelledBookings || 0,
                            'Tỷ lệ lấp đầy TB (%)': (item.averageOccupancyRate || 0).toFixed(2),
                            'Tỷ lệ hủy (%)': (item.cancellationRate || 0).toFixed(2),
                        };
                    });
                } else if (reportData?.data) {
                    worksheetData = (reportData.data || []).map((item: any) => {
                        const partnerInfo = hotelPartnerMap.get(item?.hotelId || '');
                        return {
                            'Tên khách sạn': item.hotelName || '',
                            'Admin khách sạn': partnerInfo?.name || 'N/A',
                            'Email': partnerInfo?.email || 'N/A',
                            'Doanh thu (VND)': item.totalRevenue || 0,
                            'Đặt phòng hoàn thành': item.totalCompletedBookings || 0,
                            'Đặt phòng đã tạo': item.totalCreatedBookings || 0,
                            'Đặt phòng đã hủy': item.totalCancelledBookings || 0,
                            'Tỷ lệ lấp đầy TB (%)': (item.averageOccupancyRate || 0).toFixed(2),
                            'Tỷ lệ hủy (%)': (item.cancellationRate || 0).toFixed(2),
                        };
                    });
                }
                break;
            case 'users':
                if ('currentPeriod' in reportData && reportData.currentPeriod) {
                    worksheetData = [
                        { 'Chỉ số': 'Khách hàng mới', 'Giá trị': reportData.currentPeriod.growth?.newCustomers || 0 },
                        { 'Chỉ số': 'Đối tác mới', 'Giá trị': reportData.currentPeriod.growth?.newPartners || 0 },
                        { 'Chỉ số': 'Tổng khách hàng', 'Giá trị': reportData.currentPeriod.platformTotals?.totalCustomers || 0 },
                        { 'Chỉ số': 'Tổng đối tác', 'Giá trị': reportData.currentPeriod.platformTotals?.totalPartners || 0 },
                    ];
                } else if (reportData) {
                    worksheetData = [
                        { 'Chỉ số': 'Khách hàng mới', 'Giá trị': reportData.growth?.newCustomers || 0 },
                        { 'Chỉ số': 'Đối tác mới', 'Giá trị': reportData.growth?.newPartners || 0 },
                        { 'Chỉ số': 'Tổng khách hàng', 'Giá trị': reportData.platformTotals?.totalCustomers || 0 },
                        { 'Chỉ số': 'Tổng đối tác', 'Giá trị': reportData.platformTotals?.totalPartners || 0 },
                    ];
                }
                break;
            case 'seasonality':
                if (reportData?.data) {
                    worksheetData = (reportData.data || []).map((item: any) => ({
                        'Tháng': item.month || '',
                        'Doanh thu (VND)': item.totalRevenue || 0,
                        'Số đặt phòng': item.totalBookings || 0,
                    }));
                }
                break;
            case 'locations':
                if (reportData?.data) {
                    worksheetData = (reportData.data || []).map((item: any) => ({
                        'Địa điểm': item.locationName || '',
                        'Doanh thu (VND)': item.totalRevenue || 0,
                        'Số đặt phòng': item.totalBookings || 0,
                    }));
                }
                break;
            case 'rooms':
                if (reportData?.data) {
                    worksheetData = (reportData.data || []).map((item: any) => ({
                        'Loại phòng': item.roomCategory || '',
                        'Số đêm đã đặt': item.totalBookedNights || 0,
                    }));
                }
                break;
            case 'financials':
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    worksheetData = (reportData.currentPeriod.data || []).map((item: any) => ({
                        'Kỳ': item.period || '',
                        'Doanh thu gộp (VND)': item.grossRevenue || 0,
                        'Doanh thu ròng (VND)': item.netRevenue || 0,
                        'Thanh toán đối tác (VND)': item.partnerPayout || 0,
                        'Biên lợi nhuận (%)': (item.grossMargin || 0).toFixed(2),
                    }));
                } else if (reportData?.data) {
                    worksheetData = (reportData.data || []).map((item: any) => ({
                        'Kỳ': item.period || '',
                        'Doanh thu gộp (VND)': item.grossRevenue || 0,
                        'Doanh thu ròng (VND)': item.netRevenue || 0,
                        'Thanh toán đối tác (VND)': item.partnerPayout || 0,
                        'Biên lợi nhuận (%)': (item.grossMargin || 0).toFixed(2),
                    }));
                }
                break;
        }

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo');

        const reportTypeNames: { [key in ReportType]: string } = {
            revenue: 'DoanhThu',
            hotels: 'HieuSuatKhachSan',
            users: 'NguoiDung',
            seasonality: 'TinhMuaVu',
            locations: 'DiaDiemPhoBien',
            rooms: 'LoaiPhongPhoBien',
            financials: 'TaiChinh',
        };

        XLSX.writeFile(workbook, `BaoCao_${reportTypeNames[activeTab]}_${dateRange.from}_${dateRange.to}.xlsx`);
    };


    const renderChart = () => {
        if (!reportData) return null;

        let chartOptions: ApexOptions | null = null;
        let chartSeries: any[] = [];

        switch (activeTab) {
            case 'revenue':
                // BIỂU ĐỒ CỘT cho doanh thu
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    const currentData = Array.isArray(reportData.currentPeriod.data) 
                        ? reportData.currentPeriod.data 
                        : [];
                    const previousData = Array.isArray(reportData.previousPeriod?.data) 
                        ? reportData.previousPeriod.data 
                        : [];
                    
                    chartOptions = {
                        chart: { 
                            type: 'bar', 
                            toolbar: { show: false },
                            stacked: false,
                        },
                        xaxis: {
                            categories: currentData.map((item: any) => {
                                const date = new Date(item?.period || '');
                                if (groupBy === 'month') {
                                    return `${date.getMonth() + 1}/${date.getFullYear()}`;
                                } else if (groupBy === 'week') {
                                    const weekNumber = Math.ceil(date.getDate() / 7);
                                    return `Tuần ${weekNumber}`;
                                }
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }),
                            title: { text: 'Thời gian' },
                        },
                        yaxis: { 
                            title: { text: 'Doanh thu (VND)' },
                            labels: {
                                formatter: (val: number) => formatMoney(val),
                            },
                        },
                        colors: ['#2563eb', '#10b981'],
                        legend: { position: 'top' },
                        plotOptions: {
                            bar: {
                                columnWidth: '60%',
                                borderRadius: 4,
                            },
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        tooltip: {
                            y: {
                                formatter: (val: number) => `${val.toLocaleString('en-US')} VND`,
                            },
                        },
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
                    chartOptions = {
                        chart: { 
                            type: 'bar', 
                            toolbar: { show: false },
                        },
                        xaxis: {
                            categories: data.map((item: any) => {
                                const date = new Date(item?.period || '');
                                if (groupBy === 'month') {
                                    return `${date.getMonth() + 1}/${date.getFullYear()}`;
                                } else if (groupBy === 'week') {
                                    const weekNumber = Math.ceil(date.getDate() / 7);
                                    return `Tuần ${weekNumber}`;
                                }
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }),
                            title: { text: 'Thời gian' },
                        },
                        yaxis: { 
                            title: { text: 'Doanh thu (VND)' },
                            labels: {
                                formatter: (val: number) => formatMoney(val),
                            },
                        },
                        colors: ['#2563eb'],
                        plotOptions: {
                            bar: {
                                columnWidth: '60%',
                                borderRadius: 4,
                            },
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        tooltip: {
                            y: {
                                formatter: (val: number) => `${val.toLocaleString('en-US')} VND`,
                            },
                        },
                    };
                    chartSeries = [{
                        name: 'Doanh thu',
                        data: data.map((item: any) => item?.revenue || 0),
                    }];
                }
                break;
            case 'hotels':
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    const data = (reportData.currentPeriod.data || []).slice(0, 15);
                    chartOptions = {
                        chart: { type: 'bar', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => item.hotelName || ''),
                        },
                        yaxis: { 
                            title: { text: 'Doanh thu (VND)' },
                            labels: {
                                formatter: (val: number) => formatMoney(val),
                            },
                        },
                        colors: ['#2563eb'],
                        tooltip: {
                            y: {
                                formatter: (val: number) => `${val.toLocaleString('en-US')} VND`,
                            },
                        },
                    };
                    chartSeries = [{
                        name: 'Doanh thu',
                        data: data.map((item: any) => item.totalRevenue || 0),
                    }];
                } else if (reportData?.data) {
                    const data = (reportData.data || []).slice(0, 15);
                    chartOptions = {
                        chart: { type: 'bar', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => item.hotelName || ''),
                        },
                        yaxis: { 
                            title: { text: 'Doanh thu (VND)' },
                            labels: {
                                formatter: (val: number) => formatMoney(val),
                            },
                        },
                        colors: ['#2563eb'],
                        tooltip: {
                            y: {
                                formatter: (val: number) => `${val.toLocaleString('en-US')} VND`,
                            },
                        },
                    };
                    chartSeries = [{
                        name: 'Doanh thu',
                        data: data.map((item: any) => item.totalRevenue || 0),
                    }];
                }
                break;
            case 'seasonality':
                if (reportData?.data) {
                    const data = Array.isArray(reportData.data) ? reportData.data : [];
                    chartOptions = {
                        chart: { type: 'bar', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => item?.month || ''),
                        },
                        yaxis: { 
                            title: { text: metric === 'revenue' ? 'Doanh thu (VND)' : 'Số đặt phòng' },
                            labels: {
                                formatter: (val: number) => metric === 'revenue' ? formatMoney(val) : val.toLocaleString('en-US'),
                            },
                        },
                        colors: ['#2563eb'],
                        plotOptions: {
                            bar: {
                                columnWidth: '60%',
                                borderRadius: 4,
                            },
                        },
                    };
                    chartSeries = [{
                        name: metric === 'revenue' ? 'Doanh thu' : 'Số đặt phòng',
                        data: data.map((item: any) => metric === 'revenue' ? (item?.totalRevenue || 0) : (item?.totalBookings || 0)),
                    }];
                }
                break;
            case 'rooms':
                if (reportData?.data) {
                    const data = Array.isArray(reportData.data) ? reportData.data : [];
                    if (data.length > 0) {
                        chartOptions = {
                            chart: { type: 'bar', toolbar: { show: false } },
                            xaxis: {
                                categories: data.map((item: any) => item?.roomCategory || ''),
                            },
                            yaxis: { 
                                title: { text: 'Số đêm đã đặt' },
                                labels: {
                                    formatter: (val: number) => val.toLocaleString('en-US'),
                                },
                            },
                            colors: ['#2563eb'],
                            plotOptions: {
                                bar: {
                                    columnWidth: '60%',
                                    borderRadius: 4,
                                },
                            },
                            tooltip: {
                                y: {
                                    formatter: (val: number) => `${val.toLocaleString('en-US')} đêm`,
                                },
                            },
                        };
                        chartSeries = [{
                            name: 'Số đêm đã đặt',
                            data: data.map((item: any) => item?.totalBookedNights || 0),
                        }];
                    }
                }
                break;
            case 'locations':
                if (reportData?.data) {
                    const data = Array.isArray(reportData.data) ? reportData.data : [];
                    chartOptions = {
                        chart: { type: 'bar', toolbar: { show: false }, horizontal: true },
                        xaxis: {
                            categories: data.map((item: any) => item?.locationName || ''),
                        },
                        yaxis: { 
                            title: { text: metric === 'revenue' ? 'Doanh thu (VND)' : 'Số đặt phòng' },
                            labels: {
                                formatter: (val: number) => metric === 'revenue' ? formatMoney(val) : val.toLocaleString('en-US'),
                            },
                        },
                        colors: ['#2563eb'],
                    };
                    chartSeries = [{
                        name: metric === 'revenue' ? 'Doanh thu' : 'Số đặt phòng',
                        data: data.map((item: any) => metric === 'revenue' ? (item?.totalRevenue || 0) : (item?.totalBookings || 0)),
                    }];
                }
                break;
            case 'financials':
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    const data = reportData.currentPeriod.data || [];
                    chartOptions = {
                        chart: { type: 'bar', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => item.period || ''),
                        },
                        yaxis: { 
                            title: { text: 'Giá trị (VND)' },
                            labels: {
                                formatter: (val: number) => formatMoney(val),
                            },
                        },
                        colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
                        legend: { position: 'top' },
                        plotOptions: {
                            bar: {
                                columnWidth: '60%',
                                borderRadius: 4,
                            },
                        },
                        tooltip: {
                            shared: true,
                            intersect: false,
                            y: {
                                formatter: (val: number, opts: any) => {
                                    const seriesName = opts.seriesNames[opts.seriesIndex];
                                    let description = '';
                                    if (seriesName === 'Doanh thu gộp') {
                                        description = ' (Tổng tiền khách hàng trả)';
                                    } else if (seriesName === 'Doanh thu ròng') {
                                        description = ' (Phần Holidate thu về sau khi trừ hoa hồng)';
                                    } else if (seriesName === 'Thanh toán đối tác') {
                                        description = ' (Phần trả cho khách sạn)';
                                    }
                                    return `${val.toLocaleString('en-US')} VND${description}`;
                                },
                            },
                        },
                    };
                    chartSeries = [
                        {
                            name: 'Doanh thu gộp',
                            data: data.map((item: any) => item.grossRevenue || 0),
                        },
                        {
                            name: 'Doanh thu ròng',
                            data: data.map((item: any) => item.netRevenue || 0),
                        },
                        {
                            name: 'Thanh toán đối tác',
                            data: data.map((item: any) => item.partnerPayout || 0),
                        },
                    ];
                } else if (reportData?.data) {
                    const data = reportData.data || [];
                    chartOptions = {
                        chart: { type: 'bar', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => item.period || ''),
                        },
                        yaxis: { 
                            title: { text: 'Giá trị (VND)' },
                            labels: {
                                formatter: (val: number) => formatMoney(val),
                            },
                        },
                        colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
                        legend: { position: 'top' },
                        plotOptions: {
                            bar: {
                                columnWidth: '60%',
                                borderRadius: 4,
                            },
                        },
                        tooltip: {
                            shared: true,
                            intersect: false,
                            y: {
                                formatter: (val: number, opts: any) => {
                                    const seriesName = opts.seriesNames[opts.seriesIndex];
                                    let description = '';
                                    if (seriesName === 'Doanh thu gộp') {
                                        description = ' (Tổng tiền khách hàng trả)';
                                    } else if (seriesName === 'Doanh thu ròng') {
                                        description = ' (Phần Holidate thu về sau khi trừ hoa hồng)';
                                    } else if (seriesName === 'Thanh toán đối tác') {
                                        description = ' (Phần trả cho khách sạn)';
                                    }
                                    return `${val.toLocaleString('en-US')} VND${description}`;
                                },
                            },
                        },
                    };
                    chartSeries = [
                        {
                            name: 'Doanh thu gộp',
                            data: data.map((item: any) => item.grossRevenue || 0),
                        },
                        {
                            name: 'Doanh thu ròng',
                            data: data.map((item: any) => item.netRevenue || 0),
                        },
                        {
                            name: 'Thanh toán đối tác',
                            data: data.map((item: any) => item.partnerPayout || 0),
                        },
                    ];
                }
                break;
        }

        if (!chartOptions || chartSeries.length === 0) {
            console.log('[SuperAdminReports] No chart data:', {
                hasOptions: !!chartOptions,
                seriesLength: chartSeries.length,
                reportData: reportData
            });
            return (
                <div className="alert alert-info">
                    <p>Không có dữ liệu để hiển thị biểu đồ. Vui lòng kiểm tra lại khoảng thời gian đã chọn.</p>
                </div>
            );
        }

        console.log('[SuperAdminReports] Rendering chart:', {
            chartType: chartOptions.chart?.type,
            seriesCount: chartSeries.length,
            categoriesCount: chartOptions.xaxis?.categories?.length || 0
        });

        return <Chart options={chartOptions} series={chartSeries} type={chartOptions.chart?.type || 'bar'} height={400} />;
    };

    const renderReportContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3">Đang tải dữ liệu báo cáo...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-danger" role="alert">
                    <h5>Lỗi!</h5>
                    <p>{error}</p>
                </div>
            );
        }

        if (!reportData) {
            return (
                <div className="alert alert-info" role="alert">
                    Chọn khoảng thời gian để xem báo cáo.
                </div>
            );
        }

        return (
            <div id="report-content">
                {/* Summary Cards */}
                {activeTab === 'revenue' && (
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card bg-primary text-white">
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2">Tổng doanh thu (Tất cả khách sạn)</h6>
                                    <h3 className="card-title">
                                        {(() => {
                                            // Lấy summary từ API
                                            const summary = ('currentPeriod' in reportData && reportData.currentPeriod?.summary)
                                                ? reportData.currentPeriod.summary
                                                : reportData?.summary;
                                            
                                            // Lấy data array để tính tổng thay thế nếu cần
                                            const dataArray = ('currentPeriod' in reportData && reportData.currentPeriod?.data)
                                                ? reportData.currentPeriod.data
                                                : (reportData?.data || []);
                                            
                                            // Tính tổng từ data array (đây là tổng thực tế từ các data points có sẵn)
                                            const calculatedTotal = dataArray.reduce((sum: number, item: any) => {
                                                return sum + (item?.revenue || 0);
                                            }, 0);
                                            
                                            // Ưu tiên dùng summary.totalRevenue từ backend
                                            // Nhưng nếu calculatedTotal khác nhiều, có thể summary đang thiếu data
                                            let totalRevenue = summary?.totalRevenue || calculatedTotal;
                                            
                                            // Nếu summary.totalRevenue = 0 nhưng có data, dùng calculatedTotal
                                            if (summary?.totalRevenue === 0 && calculatedTotal > 0) {
                                                totalRevenue = calculatedTotal;
                                            }
                                            
                                            // Nếu calculatedTotal lớn hơn summary nhiều, có thể summary thiếu data
                                            // Trong trường hợp này, dùng calculatedTotal (tổng từ data points có sẵn)
                                            if (calculatedTotal > summary?.totalRevenue * 1.5 && calculatedTotal > 0) {
                                                console.warn('[SuperAdminReports] Summary total may be incomplete, using calculated total:', {
                                                    summaryTotal: summary?.totalRevenue,
                                                    calculatedTotal: calculatedTotal,
                                                    difference: calculatedTotal - (summary?.totalRevenue || 0)
                                                });
                                                totalRevenue = calculatedTotal;
                                            }
                                            
                                            console.log('[SuperAdminReports] Revenue calculation:', {
                                                summaryTotal: summary?.totalRevenue,
                                                calculatedTotal: calculatedTotal,
                                                finalTotal: totalRevenue,
                                                dataLength: dataArray.length
                                            });
                                            
                                            // Kiểm tra data có đầy đủ không (dựa trên groupBy)
                                            const fromDateObj = new Date(dateRange.from);
                                            const toDateObj = new Date(dateRange.to);
                                            let expectedDataPoints: number;
                                            
                                            if (groupBy === 'month') {
                                                const fromYear = fromDateObj.getFullYear();
                                                const fromMonth = fromDateObj.getMonth();
                                                const toYear = toDateObj.getFullYear();
                                                const toMonth = toDateObj.getMonth();
                                                expectedDataPoints = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
                                            } else if (groupBy === 'week') {
                                                const daysDiff = Math.ceil((toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                                expectedDataPoints = Math.ceil(daysDiff / 7);
                                            } else {
                                                const daysDiff = Math.ceil((toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                                expectedDataPoints = daysDiff;
                                            }
                                            
                                            const dataCompleteness = dataArray.length / expectedDataPoints;
                                            
                                            console.log('[SuperAdminReports] Displaying total revenue:', {
                                                fromSummary: summary?.totalRevenue,
                                                fromCalculation: totalRevenue,
                                                dataArrayLength: dataArray.length,
                                                groupBy: groupBy,
                                                expectedDataPoints: expectedDataPoints,
                                                completeness: (dataCompleteness * 100).toFixed(1) + '%',
                                                dateRange: dateRange
                                            });
                                            
                                            return formatMoney(totalRevenue);
                                        })()} VND
                                    </h3>
                                    <small className="text-white-50">
                                        Khoảng thời gian: {dateRange.from} đến {dateRange.to}
                                    </small>
                                </div>
                            </div>
                        </div>
                        {compareEnabled && ('comparison' in reportData) && (
                            <div className="col-md-6">
                                <div className="card bg-info text-white">
                                    <div className="card-body">
                                        <h6 className="card-subtitle mb-2">Thay đổi so với kỳ trước</h6>
                                        <h3 className="card-title">
                                            {reportData.comparison.totalRevenuePercentageChange >= 0 ? '+' : ''}
                                            {reportData.comparison.totalRevenuePercentageChange.toFixed(2)}%
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chart */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-3">
                            {activeTab === 'revenue' && 'Biểu đồ doanh thu tổng hợp'}
                            {activeTab === 'hotels' && 'Top khách sạn theo doanh thu'}
                            {activeTab === 'users' && 'Thống kê người dùng'}
                            {activeTab === 'seasonality' && 'Phân tích mùa vụ'}
                            {activeTab === 'locations' && 'Địa điểm phổ biến'}
                            {activeTab === 'rooms' && 'Loại phòng phổ biến'}
                            {activeTab === 'financials' && 'Báo cáo tài chính'}
                        </h5>
                        {activeTab === 'financials' && (
                            <div>
                                <div className="alert alert-info mb-3" style={{ fontSize: '0.875rem' }}>
                                    <strong>Giải thích các chỉ số:</strong>
                                    <ul className="mb-0 mt-2" style={{ paddingLeft: '1.5rem' }}>
                                        <li><strong>Doanh thu gộp:</strong> Tổng tiền khách hàng trả cho tất cả bookings đã hoàn thành</li>
                                        <li><strong>Doanh thu ròng:</strong> Phần tiền Holidate thực sự thu về sau khi trừ hoa hồng (Doanh thu gộp × Tỷ lệ hoa hồng)</li>
                                        <li><strong>Thanh toán đối tác:</strong> Phần tiền trả cho các khách sạn (Doanh thu gộp - Doanh thu ròng)</li>
                                    </ul>
                                    <small className="text-muted">Công thức: Doanh thu gộp = Doanh thu ròng + Thanh toán đối tác</small>
                                </div>
                                {(() => {
                                    const summary = ('currentPeriod' in reportData && reportData.currentPeriod?.summary)
                                        ? reportData.currentPeriod.summary
                                        : reportData?.summary;
                                    
                                    if (summary?.totalGrossRevenue && summary.totalGrossRevenue > 0) {
                                        const netRevenueRatio = (summary.totalNetRevenue || 0) / summary.totalGrossRevenue;
                                        const commissionRate = netRevenueRatio * 100;
                                        
                                        // Cảnh báo nếu tỷ lệ hoa hồng quá thấp (< 5%)
                                        if (commissionRate < 5) {
                                            return (
                                                <div className="alert alert-warning mb-3" style={{ fontSize: '0.875rem' }}>
                                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                                    <strong>Cảnh báo:</strong> Tỷ lệ hoa hồng trung bình hiện tại là <strong>{commissionRate.toFixed(2)}%</strong>, 
                                                    thấp hơn mức mặc định (15%). 
                                                    <br />
                                                    <small className="text-muted">
                                                        Điều này có nghĩa là doanh thu ròng của Holidate rất thấp. 
                                                        Vui lòng kiểm tra <code>commission_rate</code> của các khách sạn trong database.
                                                    </small>
                                                </div>
                                            );
                                        }
                                        
                                        // Hiển thị tỷ lệ hoa hồng bình thường
                                        return (
                                            <div className="alert alert-success mb-3" style={{ fontSize: '0.875rem' }}>
                                                <i className="bi bi-info-circle me-2"></i>
                                                <strong>Tỷ lệ hoa hồng trung bình:</strong> <strong>{commissionRate.toFixed(2)}%</strong>
                                                <br />
                                                <small className="text-muted">
                                                    Tỷ lệ này được tính từ: (Doanh thu ròng / Doanh thu gộp) × 100%
                                                </small>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        )}
                        {renderChart()}
                    </div>
                </div>

                {/* Data Table */}
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-3">Chi tiết dữ liệu</h5>
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead className="table-dark">
                                    <tr>
                                        {activeTab === 'revenue' && (
                                            <>
                                                <th>Kỳ</th>
                                                <th>Doanh thu (VND)</th>
                                            </>
                                        )}
                                        {activeTab === 'hotels' && (
                                            <>
                                                <th>STT</th>
                                                <th>Tên khách sạn</th>
                                                <th>Admin khách sạn</th>
                                                <th>Email</th>
                                                <th>Doanh thu (VND)</th>
                                                <th>Đặt phòng hoàn thành</th>
                                                <th>Tỷ lệ lấp đầy TB (%)</th>
                                                <th>Tỷ lệ hủy (%)</th>
                                            </>
                                        )}
                                        {activeTab === 'users' && (
                                            <>
                                                <th>Chỉ số</th>
                                                <th>Giá trị</th>
                                            </>
                                        )}
                                        {activeTab === 'seasonality' && (
                                            <>
                                                <th>Tháng</th>
                                                <th>Doanh thu (VND)</th>
                                                <th>Số đặt phòng</th>
                                            </>
                                        )}
                                        {activeTab === 'locations' && (
                                            <>
                                                <th>Địa điểm</th>
                                                <th>Doanh thu (VND)</th>
                                                <th>Số đặt phòng</th>
                                            </>
                                        )}
                                        {activeTab === 'rooms' && (
                                            <>
                                                <th>Loại phòng</th>
                                                <th>Số đêm đã đặt</th>
                                            </>
                                        )}
                                        {activeTab === 'financials' && (
                                            <>
                                                <th>Kỳ</th>
                                                <th>Doanh thu gộp (VND)</th>
                                                <th>Doanh thu ròng (VND)</th>
                                                <th>Thanh toán đối tác (VND)</th>
                                                <th>Biên lợi nhuận (%)</th>
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
                                                        <td>{(item?.revenue || 0).toLocaleString('en-US')} VND</td>
                                                    </tr>
                                                ))}
                                            </>
                                        );
                                    })()}
                                    {activeTab === 'hotels' && (
                                        <>
                                            {((('currentPeriod' in reportData && reportData.currentPeriod?.data) 
                                                ? reportData.currentPeriod.data 
                                                : (reportData?.data || [])) || []).map((item: any, index: number) => {
                                                const partnerInfo = hotelPartnerMap.get(item?.hotelId || '');
                                                return (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item?.hotelName || ''}</td>
                                                        <td>{partnerInfo?.name || 'N/A'}</td>
                                                        <td>{partnerInfo?.email || 'N/A'}</td>
                                                        <td>{(item?.totalRevenue || 0).toLocaleString('en-US')} VND</td>
                                                        <td>{item?.totalCompletedBookings ?? 0}</td>
                                                        <td>{(item?.averageOccupancyRate ?? 0).toFixed(2)}%</td>
                                                        <td>{(item?.cancellationRate ?? 0).toFixed(2)}%</td>
                                                    </tr>
                                                );
                                            })}
                                        </>
                                    )}
                                    {activeTab === 'users' && (
                                        <>
                                            {Object.entries(('currentPeriod' in reportData && reportData.currentPeriod) ? {
                                                'Khách hàng mới': reportData.currentPeriod.growth?.newCustomers || 0,
                                                'Đối tác mới': reportData.currentPeriod.growth?.newPartners || 0,
                                                'Tổng khách hàng': reportData.currentPeriod.platformTotals?.totalCustomers || 0,
                                                'Tổng đối tác': reportData.currentPeriod.platformTotals?.totalPartners || 0,
                                            } : {
                                                'Khách hàng mới': reportData?.growth?.newCustomers || 0,
                                                'Đối tác mới': reportData?.growth?.newPartners || 0,
                                                'Tổng khách hàng': reportData?.platformTotals?.totalCustomers || 0,
                                                'Tổng đối tác': reportData?.platformTotals?.totalPartners || 0,
                                            }).map(([key, value]: [string, any]) => (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td>{typeof value === 'number' ? value.toLocaleString('en-US') : value}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    {activeTab === 'seasonality' && (() => {
                                        const dataArray = Array.isArray(reportData?.data) ? reportData.data : [];
                                        return dataArray.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td>{item?.month || ''}</td>
                                                <td>{(item?.totalRevenue || 0).toLocaleString('en-US')} VND</td>
                                                <td>{item?.totalBookings || 0}</td>
                                            </tr>
                                        ));
                                    })()}
                                    {activeTab === 'locations' && (() => {
                                        const dataArray = Array.isArray(reportData?.data) ? reportData.data : [];
                                        return dataArray.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td>{item?.locationName || ''}</td>
                                                <td>{(item?.totalRevenue || 0).toLocaleString('en-US')} VND</td>
                                                <td>{item?.totalBookings || 0}</td>
                                            </tr>
                                        ));
                                    })()}
                                    {activeTab === 'rooms' && (() => {
                                        const dataArray = Array.isArray(reportData?.data) ? reportData.data : [];
                                        return dataArray.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td>{item?.roomCategory || ''}</td>
                                                <td>{item?.totalBookedNights || 0}</td>
                                            </tr>
                                        ));
                                    })()}
                                    {activeTab === 'financials' && (
                                        <>
                                            {((('currentPeriod' in reportData && reportData.currentPeriod?.data) 
                                                ? reportData.currentPeriod.data 
                                                : (reportData?.data || [])) || []).map((item: any, index: number) => (
                                                <tr key={index}>
                                                    <td>{item?.period || ''}</td>
                                                    <td>{(item?.grossRevenue || 0).toLocaleString('en-US')} VND</td>
                                                    <td>{(item?.netRevenue || 0).toLocaleString('en-US')} VND</td>
                                                    <td>{(item?.partnerPayout || 0).toLocaleString('en-US')} VND</td>
                                                    <td>{(item?.grossMargin || 0).toFixed(2)}%</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0 text-dark">Báo cáo hệ thống</h1>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-success"
                        onClick={exportToExcel}
                        disabled={!reportData || isLoading}
                    >
                        <i className="bi bi-file-earmark-excel me-2"></i>
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Bộ lọc</h5>
                    <div className="row g-3">
                        <div className="col-md-2">
                            <label className="form-label">Lọc theo</label>
                            <select
                                className="form-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as 'custom' | 'quarter' | 'month' | 'year')}
                            >
                                <option value="custom">Tùy chọn</option>
                                <option value="quarter">Theo quý</option>
                                <option value="month">Theo tháng</option>
                                <option value="year">Theo năm</option>
                            </select>
                        </div>
                        {filterType === 'custom' && (
                            <>
                                <div className="col-md-2">
                                    <label className="form-label">Từ ngày</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dateRange.from}
                                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Đến ngày</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dateRange.to}
                                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                        {filterType === 'quarter' && (
                            <>
                                <div className="col-md-2">
                                    <label className="form-label">Quý</label>
                                    <select
                                        className="form-select"
                                        value={selectedQuarter.quarter}
                                        onChange={(e) => setSelectedQuarter({ ...selectedQuarter, quarter: parseInt(e.target.value) })}
                                    >
                                        <option value="1">Quý 1 (Jan-Mar)</option>
                                        <option value="2">Quý 2 (Apr-Jun)</option>
                                        <option value="3">Quý 3 (Jul-Sep)</option>
                                        <option value="4">Quý 4 (Oct-Dec)</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Năm</label>
                                    <select
                                        className="form-select"
                                        value={selectedQuarter.year}
                                        onChange={(e) => setSelectedQuarter({ ...selectedQuarter, year: parseInt(e.target.value) })}
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                        {filterType === 'month' && (
                            <>
                                <div className="col-md-2">
                                    <label className="form-label">Tháng</label>
                                    <select
                                        className="form-select"
                                        value={selectedMonth.month}
                                        onChange={(e) => setSelectedMonth({ ...selectedMonth, month: parseInt(e.target.value) })}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month}>Tháng {month}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Năm</label>
                                    <select
                                        className="form-select"
                                        value={selectedMonth.year}
                                        onChange={(e) => setSelectedMonth({ ...selectedMonth, year: parseInt(e.target.value) })}
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                        {filterType === 'year' && (
                            <div className="col-md-2">
                                <label className="form-label">Năm</label>
                                <select
                                    className="form-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {(activeTab === 'revenue' || activeTab === 'financials') && (
                            <div className="col-md-2">
                                <label className="form-label">Nhóm theo</label>
                                <select
                                    className="form-select"
                                    value={groupBy}
                                    onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
                                >
                                    <option value="day">Ngày</option>
                                    <option value="week">Tuần</option>
                                    <option value="month">Tháng</option>
                                </select>
                            </div>
                        )}
                        {(activeTab === 'seasonality' || activeTab === 'locations') && (
                            <div className="col-md-2">
                                <label className="form-label">Chỉ số</label>
                                <select
                                    className="form-select"
                                    value={metric}
                                    onChange={(e) => setMetric(e.target.value as 'revenue' | 'bookings')}
                                >
                                    <option value="revenue">Doanh thu</option>
                                    <option value="bookings">Số đặt phòng</option>
                                </select>
                            </div>
                        )}
                        {activeTab === 'locations' && (
                            <div className="col-md-2">
                                <label className="form-label">Cấp độ</label>
                                <select
                                    className="form-select"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value as 'city' | 'province')}
                                >
                                    <option value="city">Thành phố</option>
                                    <option value="province">Tỉnh/Thành</option>
                                </select>
                            </div>
                        )}
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
                        Doanh thu tổng hợp
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'hotels' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hotels')}
                    >
                        Hiệu suất khách sạn
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Thống kê người dùng
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'seasonality' ? 'active' : ''}`}
                        onClick={() => setActiveTab('seasonality')}
                    >
                        Phân tích mùa vụ
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'locations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('locations')}
                    >
                        Địa điểm phổ biến
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rooms')}
                    >
                        Loại phòng phổ biến
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'financials' ? 'active' : ''}`}
                        onClick={() => setActiveTab('financials')}
                    >
                        Báo cáo tài chính
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
