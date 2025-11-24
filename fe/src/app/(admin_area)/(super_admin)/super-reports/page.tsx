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
    const [filterBy, setFilterBy] = useState<'hotel' | 'city' | 'province' | ''>('');
    const [compareEnabled, setCompareEnabled] = useState(false);
    const [compareDateRange, setCompareDateRange] = useState({ from: '', to: '' });
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metric, setMetric] = useState<'revenue' | 'bookings'>('revenue');
    const [level, setLevel] = useState<'city' | 'province'>('city');
    const [hotelPartnerMap, setHotelPartnerMap] = useState<Map<string, { name: string; email: string }>>(new Map());
    const [filterType, setFilterType] = useState<'custom' | 'quarter' | 'month' | 'year'>('custom');
    const [selectedQuarter, setSelectedQuarter] = useState<{ quarter: number; year: number }>({ quarter: Math.floor(new Date().getMonth() / 3) + 1, year: new Date().getFullYear() });
    const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number }>({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Initialize dates - Lấy data từ 30 ngày trước để đảm bảo có đủ data
    useEffect(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        
        setDateRange({
            from: thirtyDaysAgo.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0],
        });
        
        setCompareDateRange({
            from: lastMonth.toISOString().split('T')[0],
            to: new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0],
        });
    }, []);

    // Update date range based on filter type
    useEffect(() => {
        if (filterType === 'custom') return; // Don't auto-update if custom

        let fromDate: Date;
        let toDate: Date;

        if (filterType === 'quarter') {
            // Quarter: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)
            const startMonth = (selectedQuarter.quarter - 1) * 3; // 0, 3, 6, 9
            fromDate = new Date(selectedQuarter.year, startMonth, 1);
            toDate = new Date(selectedQuarter.year, startMonth + 3, 0); // Last day of quarter
        } else if (filterType === 'month') {
            fromDate = new Date(selectedMonth.year, selectedMonth.month - 1, 1);
            toDate = new Date(selectedMonth.year, selectedMonth.month, 0); // Last day of month
        } else if (filterType === 'year') {
            fromDate = new Date(selectedYear, 0, 1); // Jan 1
            toDate = new Date(selectedYear, 11, 31); // Dec 31
        } else {
            return;
        }

        const fromStr = fromDate.toISOString().split('T')[0];
        const toStr = toDate.toISOString().split('T')[0];

        console.log('[SuperAdminReports] Auto-updating date range:', {
            filterType,
            selectedMonth,
            selectedQuarter,
            selectedYear,
            fromDate: fromStr,
            toDate: toStr,
            fromDateObj: fromDate,
            toDateObj: toDate
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
                
                // Ưu tiên: Lấy từ hotel admins (có đầy đủ thông tin)
                try {
                    const adminsResponse = await getHotelAdmins({ page: 1, limit: 1000 });
                    const admins = adminsResponse.data || [];
                    
                    admins.forEach((admin: any) => {
                        if (admin.hotels && admin.hotels.length > 0) {
                            // Ưu tiên fullName, nếu không có thì dùng name, cuối cùng mới dùng username
                            const displayName = admin.fullName || admin.name || admin.username || admin.email || 'N/A';
                            admin.hotels.forEach((hotel: any) => {
                                map.set(hotel.id, {
                                    name: displayName,
                                    email: admin.email || 'N/A',
                                });
                            });
                        }
                    });
                    
                    console.log('[SuperAdminReports] Loaded', map.size, 'hotel-partner mappings from admins');
                } catch (err) {
                    console.warn('[SuperAdminReports] Error loading hotel admins:', err);
                }
                
                // Bổ sung từ getHotels nếu còn thiếu (KHÔNG filter theo userId để lấy tất cả hotels)
                try {
                    const hotelsResponse = await getHotels(0, 1000, undefined, undefined, undefined, undefined);
                    const hotels = hotelsResponse.hotels || [];
                    
                    hotels.forEach((hotel: any) => {
                        // Chỉ thêm nếu chưa có trong map
                        if (!map.has(hotel.id)) {
                            if (hotel.ownerId) {
                                map.set(hotel.id, {
                                    name: hotel.ownerName || 'N/A',
                                    email: hotel.ownerEmail || 'N/A',
                                });
                            }
                        }
                    });
                    
                    console.log('[SuperAdminReports] Total hotel-partner mappings:', map.size);
                } catch (err) {
                    console.warn('[SuperAdminReports] Error loading hotels:', err);
                }
                
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
                        data = await getAdminRevenueReport(
                            dateRange.from,
                            dateRange.to,
                            groupBy,
                            filterBy || undefined,
                            0,
                            10,
                            compareParams.compareFrom,
                            compareParams.compareTo
                        );
                        break;
                    case 'hotels':
                        console.log('[SuperAdminReports] Loading hotel performance with params:', {
                            from: dateRange.from,
                            to: dateRange.to,
                            compareParams
                        });
                        data = await getAdminHotelPerformanceReport(
                            dateRange.from,
                            dateRange.to,
                            'revenue',
                            'desc',
                            undefined,
                            undefined,
                            0,
                            20,
                            compareParams.compareFrom,
                            compareParams.compareTo
                        );
                        const hotelsData = data?.data || data?.currentPeriod?.data || [];
                        console.log('[SuperAdminReports] Hotel performance response:', {
                            hasData: !!data,
                            dataType: typeof data,
                            dataKeys: data ? Object.keys(data) : [],
                            dataLength: hotelsData.length,
                            dateRange: { from: dateRange.from, to: dateRange.to },
                            hotelsData: hotelsData,
                            hotelsWithZeroRevenue: hotelsData.filter((h: any) => (h?.totalRevenue || 0) === 0 && (h?.totalCreatedBookings || 0) > 0),
                            rawData: data
                        });
                        
                        // Kiểm tra nếu có hotels có bookings nhưng revenue = 0
                        const hotelsWithBookingsButNoRevenue = hotelsData.filter((h: any) => 
                            (h?.totalCreatedBookings || 0) > 0 && (h?.totalRevenue || 0) === 0
                        );
                        if (hotelsWithBookingsButNoRevenue.length > 0) {
                            console.warn('[SuperAdminReports] Hotels with bookings but zero revenue (may need HotelDailyReport generation):', 
                                hotelsWithBookingsButNoRevenue.map((h: any) => ({
                                    hotelName: h?.hotelName,
                                    hotelId: h?.hotelId,
                                    totalCreatedBookings: h?.totalCreatedBookings,
                                    totalCompletedBookings: h?.totalCompletedBookings,
                                    totalRevenue: h?.totalRevenue
                                }))
                            );
                        }
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
                            10
                        );
                        break;
                    case 'rooms':
                        data = await getAdminPopularRoomTypesReport(
                            dateRange.from,
                            dateRange.to,
                            'occupancy',
                            10
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

                setReportData(data);
                
                // Log data received để debug
                const hotelsData = activeTab === 'hotels' 
                    ? (data?.data || data?.currentPeriod?.data || [])
                    : [];
                
                console.log('[SuperAdminReports] Report data received:', {
                    activeTab: activeTab,
                    hasData: !!data,
                    dataType: typeof data,
                    dataKeys: data ? Object.keys(data) : [],
                    dataLength: hotelsData.length,
                    dateRange: { from: dateRange.from, to: dateRange.to },
                    hotelsData: hotelsData,
                    hotelNames: hotelsData.map((h: any) => h?.hotelName),
                    hoangNgocData: hotelsData.find((h: any) => h?.hotelName?.includes('Hoang Ngoc') || h?.hotelName?.includes('Hoàng Ngọc'))
                });
                
                // Nếu là báo cáo hotels, fetch thêm partner info cho các hotel trong báo cáo
                if (activeTab === 'hotels' && data) {
                    const hotelsData = ('currentPeriod' in data && data.currentPeriod?.data) 
                        ? data.currentPeriod.data 
                        : (data?.data || []);
                    
                    // Fetch detail cho các hotel chưa có trong map
                    const hotelsToFetch = hotelsData.filter((item: any) => {
                        const hotelId = item?.hotelId;
                        return hotelId && !hotelPartnerMap.has(hotelId);
                    });
                    
                    if (hotelsToFetch.length > 0) {
                        try {
                            const { default: apiClient } = await import('@/service/apiClient');
                            const newMap = new Map(hotelPartnerMap);
                            
                            await Promise.allSettled(
                                hotelsToFetch.map(async (item: any) => {
                                    try {
                                        const detailResponse = await apiClient.get(`/accommodation/hotels/${item.hotelId}`);
                                        const detailData = detailResponse.data?.data;
                                        
                                        if (detailData?.partner) {
                                            // Ưu tiên fullName, sau đó name, cuối cùng mới email
                                            const partnerName = detailData.partner.fullName || 
                                                               detailData.partner.name || 
                                                               detailData.partner.email || 
                                                               'N/A';
                                            newMap.set(item.hotelId, {
                                                name: partnerName,
                                                email: detailData.partner.email || 'N/A',
                                            });
                                        }
                                    } catch (err) {
                                        console.warn(`[SuperAdminReports] Error fetching hotel ${item.hotelId}:`, err);
                                    }
                                })
                            );
                            
                            if (newMap.size > hotelPartnerMap.size) {
                                setHotelPartnerMap(newMap);
                            }
                        } catch (err) {
                            console.warn('[SuperAdminReports] Error fetching hotel details:', err);
                        }
                    }
                }
            } catch (err: any) {
                console.error('[SuperAdminReportsPage] Error loading report:', err);
                setError(err.response?.data?.message || 'Không thể tải báo cáo');
            } finally {
                setIsLoading(false);
            }
        };

        loadReport();
    }, [activeTab, dateRange, groupBy, filterBy, compareEnabled, compareDateRange, metric, level]);

    const exportToExcel = async () => {
        if (!reportData) return;
        
        // Dynamic import xlsx to avoid SSR issues
        const XLSX = await import('xlsx');

        let worksheetData: any[] = [];

        switch (activeTab) {
            case 'revenue':
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    worksheetData = (reportData.currentPeriod.data || []).map((item: any) => ({
                        'Kỳ': item.period || '',
                        'Doanh thu': item.revenue || 0,
                    }));
                } else if (reportData?.data) {
                    worksheetData = (reportData.data || []).map((item: any) => ({
                        'Kỳ': item.period || '',
                        'Doanh thu': item.revenue || 0,
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
                            'Doanh thu': item.totalRevenue || 0,
                            'Đặt phòng hoàn thành': item.totalCompletedBookings || 0,
                            'Tỷ lệ lấp đầy TB': item.averageOccupancyRate || 0,
                            'Tỷ lệ hủy': item.cancellationRate || 0,
                        };
                    });
                } else if (reportData?.data) {
                    worksheetData = (reportData.data || []).map((item: any) => {
                        const partnerInfo = hotelPartnerMap.get(item?.hotelId || '');
                        return {
                            'Tên khách sạn': item.hotelName || '',
                            'Admin khách sạn': partnerInfo?.name || 'N/A',
                            'Email': partnerInfo?.email || 'N/A',
                            'Doanh thu': item.totalRevenue || 0,
                            'Đặt phòng hoàn thành': item.totalCompletedBookings || 0,
                            'Tỷ lệ lấp đầy TB': item.averageOccupancyRate || 0,
                            'Tỷ lệ hủy': item.cancellationRate || 0,
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
                        'Doanh thu': item.totalRevenue || 0,
                        'Số đặt phòng': item.totalBookings || 0,
                    }));
                }
                break;
            case 'locations':
                if (reportData?.data) {
                    worksheetData = (reportData.data || []).map((item: any) => ({
                        'Địa điểm': item.locationName || '',
                        'Doanh thu': item.totalRevenue || 0,
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
                        'Doanh thu gộp': item.grossRevenue || 0,
                        'Doanh thu ròng': item.netRevenue || 0,
                        'Thanh toán đối tác': item.partnerPayout || 0,
                        'Biên lợi nhuận': item.grossMargin || 0,
                    }));
                } else if (reportData?.data) {
                    worksheetData = (reportData.data || []).map((item: any) => ({
                        'Kỳ': item.period || '',
                        'Doanh thu gộp': item.grossRevenue || 0,
                        'Doanh thu ròng': item.netRevenue || 0,
                        'Thanh toán đối tác': item.partnerPayout || 0,
                        'Biên lợi nhuận': item.grossMargin || 0,
                    }));
                }
                break;
        }

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo');

        const reportTypeNames: { [key in ReportType]: string } = {
            revenue: 'Doanh thu',
            hotels: 'Hiệu suất khách sạn',
            users: 'Người dùng',
            seasonality: 'Tính mùa vụ',
            locations: 'Địa điểm phổ biến',
            rooms: 'Loại phòng phổ biến',
            financials: 'Tài chính',
        };

        XLSX.writeFile(workbook, `BaoCao_${reportTypeNames[activeTab]}_${dateRange.from}_${dateRange.to}.xlsx`);
    };

    const renderChart = () => {
        if (!reportData) return null;

        let chartOptions: ApexOptions | null = null;
        let chartSeries: any[] = [];

        switch (activeTab) {
            case 'revenue':
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    const currentData = Array.isArray(reportData.currentPeriod.data) 
                        ? reportData.currentPeriod.data 
                        : [];
                    const previousData = Array.isArray(reportData.previousPeriod?.data) 
                        ? reportData.previousPeriod.data 
                        : [];
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
                    chartOptions = {
                        chart: { type: 'line', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => item?.period || ''),
                        },
                        yaxis: { title: { text: 'Doanh thu (VND)' } },
                        colors: ['#2563eb'],
                    };
                    chartSeries = [{
                        name: 'Doanh thu',
                        data: data.map((item: any) => item?.revenue || 0),
                    }];
                }
                break;
            case 'hotels':
                if ('currentPeriod' in reportData && reportData.currentPeriod?.data) {
                    const data = (reportData.currentPeriod.data || []).slice(0, 10);
                    chartOptions = {
                        chart: { type: 'bar', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => item.hotelName || ''),
                        },
                        yaxis: { 
                            title: { text: 'Doanh thu (VND)' },
                            labels: {
                                formatter: (val: number) => {
                                    if (val >= 1_000_000_000) {
                                        return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
                                    } else if (val >= 1_000_000) {
                                        return `${(val / 1_000_000).toFixed(0)} triệu`;
                                    }
                                    return val.toLocaleString('en-US');
                                },
                            },
                        },
                        colors: ['#2563eb'],
                        tooltip: {
                            y: {
                                formatter: (val: number) => {
                                    if (val >= 1_000_000_000) {
                                        return `${(val / 1_000_000_000).toFixed(2)} tỷ VND`;
                                    } else if (val >= 1_000_000) {
                                        return `${(val / 1_000_000).toFixed(1)} triệu VND`;
                                    }
                                    return `${val.toLocaleString('en-US')} VND`;
                                },
                            },
                        },
                    };
                    chartSeries = [{
                        name: 'Doanh thu',
                        data: data.map((item: any) => item.totalRevenue || 0),
                    }];
                } else if (reportData?.data) {
                    const data = (reportData.data || []).slice(0, 10);
                    chartOptions = {
                        chart: { type: 'bar', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => item.hotelName || ''),
                        },
                        yaxis: { title: { text: 'Doanh thu (VND)' } },
                        colors: ['#2563eb'],
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
                        yaxis: { title: { text: metric === 'revenue' ? 'Doanh thu (VND)' : 'Số đặt phòng' } },
                        colors: ['#2563eb'],
                    };
                    chartSeries = [{
                        name: metric === 'revenue' ? 'Doanh thu' : 'Số đặt phòng',
                        data: data.map((item: any) => metric === 'revenue' ? (item?.totalRevenue || 0) : (item?.totalBookings || 0)),
                    }];
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
                        yaxis: { title: { text: metric === 'revenue' ? 'Doanh thu (VND)' : 'Số đặt phòng' } },
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
                        chart: { type: 'line', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => item.period || ''),
                        },
                        yaxis: { title: { text: 'Giá trị (VND)' } },
                        colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
                        legend: { position: 'top' },
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
                        {
                            name: 'Biên lợi nhuận',
                            data: data.map((item: any) => item.grossMargin || 0),
                        },
                    ];
                } else if (reportData?.data) {
                    const data = reportData.data || [];
                    chartOptions = {
                        chart: { type: 'line', toolbar: { show: false } },
                        xaxis: {
                            categories: data.map((item: any) => item.period || ''),
                        },
                        yaxis: { title: { text: 'Giá trị (VND)' } },
                        colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
                        legend: { position: 'top' },
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
                        {
                            name: 'Biên lợi nhuận',
                            data: data.map((item: any) => item.grossMargin || 0),
                        },
                    ];
                }
                break;
        }

        if (!chartOptions) return null;

        return <Chart options={chartOptions} series={chartSeries} type={chartOptions.chart?.type || 'line'} height={350} />;
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
                    {error}
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
            <div>
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
                                    {activeTab === 'hotels' && (
                                        <>
                                            <th>Tên khách sạn</th>
                                            <th>Admin khách sạn</th>
                                            <th>Email</th>
                                            <th>Doanh thu</th>
                                            <th>Đặt phòng hoàn thành</th>
                                            <th>Tỷ lệ lấp đầy TB</th>
                                            <th>Tỷ lệ hủy</th>
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
                                            <th>Doanh thu</th>
                                            <th>Số đặt phòng</th>
                                        </>
                                    )}
                                    {activeTab === 'locations' && (
                                        <>
                                            <th>Địa điểm</th>
                                            <th>Doanh thu</th>
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
                                            <th>Doanh thu gộp</th>
                                            <th>Doanh thu ròng</th>
                                            <th>Thanh toán đối tác</th>
                                            <th>Biên lợi nhuận</th>
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
                                            // Log đầy đủ dữ liệu từ backend để debug
                                            const fullData = {
                                                hotelName: item?.hotelName,
                                                hotelId: item?.hotelId,
                                                totalRevenue: item?.totalRevenue,
                                                totalCompletedBookings: item?.totalCompletedBookings,
                                                totalCreatedBookings: item?.totalCreatedBookings,
                                                totalCancelledBookings: item?.totalCancelledBookings,
                                                averageOccupancyRate: item?.averageOccupancyRate,
                                                cancellationRate: item?.cancellationRate,
                                                // Log toàn bộ item để xem có field nào khác không
                                                fullItem: item,
                                                partnerInfo: partnerInfo
                                            };
                                            console.log('[SuperAdminReports] Hotel Data from Backend (FULL):', fullData);
                                            
                                            // Tính toán lại để verify
                                            if (item?.totalCreatedBookings > 0) {
                                                const calculatedCancellationRate = ((item?.totalCancelledBookings || 0) / item.totalCreatedBookings) * 100;
                                                console.log('[SuperAdminReports] Calculated cancellationRate:', {
                                                    totalCancelledBookings: item?.totalCancelledBookings || 0,
                                                    totalCreatedBookings: item.totalCreatedBookings,
                                                    calculated: calculatedCancellationRate.toFixed(2) + '%',
                                                    fromBackend: item?.cancellationRate
                                                });
                                            }
                                            return (
                                                <tr key={index}>
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
                                            ...(reportData.currentPeriod.growth || {}),
                                            ...(reportData.currentPeriod.platformTotals || {}),
                                        } : {
                                            ...(reportData?.growth || {}),
                                            ...(reportData?.platformTotals || {}),
                                        }).map(([key, value]: [string, any]) => (
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
        );
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-4 text-dark">Báo cáo hệ thống</h1>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
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
                        {activeTab === 'revenue' && (
                            <div className="col-md-2">
                                <label className="form-label">Lọc theo</label>
                                <select
                                    className="form-select"
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value as 'hotel' | 'city' | 'province' | '')}
                                >
                                    <option value="">Không lọc</option>
                                    <option value="hotel">Khách sạn</option>
                                    <option value="city">Thành phố</option>
                                    <option value="province">Tỉnh/Thành</option>
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
                        <div className="col-md-2 d-flex align-items-end">
                            <button
                                className="btn btn-primary"
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
                        Người dùng
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'seasonality' ? 'active' : ''}`}
                        onClick={() => setActiveTab('seasonality')}
                    >
                        Tính mùa vụ
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
                        Tài chính
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

