"use client";
import { useEffect, useState } from "react";
import { getAdminDashboardSummary } from "@/lib/Super_Admin/superAdminDashboardService";
import { getAdminRevenueReport, getAdminUsersSummaryReport, getAdminFinancialsReport } from "@/lib/Super_Admin/superAdminReportsService";
import StatCard from "@/components/AdminSuper/SuperAdminDashboard/StatCard";
import { FaHotel, FaUsers, FaDollarSign, FaExclamationTriangle, FaCalendarCheck } from "react-icons/fa";
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import LoadingSpinner from "@/components/AdminSuper/common/LoadingSpinner";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function SuperAdminHomePage() {
    const [data, setData] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any>(null);
    const [usersData, setUsersData] = useState<any>(null);
    const [financialsData, setFinancialsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch dashboard summary
                const dashboardData = await getAdminDashboardSummary();
                setData(dashboardData);

                // Fetch revenue trend for last 7 days
                const today = new Date();
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);

                try {
                    const fromDate = sevenDaysAgo.toISOString().split('T')[0];
                    const toDate = today.toISOString().split('T')[0];

                    const revenueReport = await getAdminRevenueReport(
                        fromDate,
                        toDate,
                        'day'
                    );
                    const revenueDataArray = ('currentPeriod' in revenueReport && revenueReport.currentPeriod?.data)
                        ? revenueReport.currentPeriod.data
                        : ('data' in revenueReport ? revenueReport.data : []);

                    console.log('[SuperAdminDashboard] Revenue data received:', {
                        hasData: !!revenueReport,
                        dataType: typeof revenueReport,
                        dataKeys: revenueReport ? Object.keys(revenueReport) : [],
                        dataArray: revenueDataArray,
                        dataLength: revenueDataArray.length,
                        fullData: revenueReport
                    });
                    setRevenueData(revenueReport);
                } catch (revenueErr: any) {
                    console.error('[SuperAdminDashboard] Error fetching revenue data:', {
                        error: revenueErr,
                        message: revenueErr?.message,
                        response: revenueErr?.response?.data,
                        status: revenueErr?.response?.status
                    });
                    // Không set error vì đây là dữ liệu bổ sung
                }

                // Fetch users summary để lấy tổng số partners
                try {
                    const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const usersSummary = await getAdminUsersSummaryReport(
                        firstDayThisMonth.toISOString().split('T')[0],
                        today.toISOString().split('T')[0]
                    );
                    const totalPartners = ('currentPeriod' in usersSummary && usersSummary.currentPeriod?.platformTotals?.totalPartners)
                        ? usersSummary.currentPeriod.platformTotals.totalPartners
                        : ('platformTotals' in usersSummary ? usersSummary.platformTotals?.totalPartners : 0);
                    setUsersData(usersSummary);
                } catch (usersErr: any) {
                    // Không set error vì đây là dữ liệu bổ sung
                }

                // Fetch financials data để lấy doanh thu hôm nay và tháng này
                try {
                    const todayStr = today.toISOString().split('T')[0];
                    const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const firstDayStr = firstDayThisMonth.toISOString().split('T')[0];

                    // Lấy financials cho hôm nay
                    const todayFinancials = await getAdminFinancialsReport(
                        todayStr,
                        todayStr,
                        'day'
                    );

                    // Lấy financials cho cả tháng
                    const monthFinancials = await getAdminFinancialsReport(
                        firstDayStr,
                        todayStr,
                        'day'
                    );

                    console.log('[SuperAdminDashboard] Financials data received:', {
                        today: todayFinancials,
                        month: monthFinancials
                    });

                    setFinancialsData({
                        today: todayFinancials,
                        month: monthFinancials
                    });
                } catch (financialsErr: any) {
                    // Không set error vì đây là dữ liệu bổ sung
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="container-fluid">
                <LoadingSpinner message="Đang tải dữ liệu dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Lỗi!</h4>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container-fluid">
                <div className="alert alert-info" role="alert">
                    Không có dữ liệu để hiển thị.
                </div>
            </div>
        );
    }

    // Chart options cho top hotels với cả doanh thu và số lượng bookings
    const topHotels = data.topPerformingHotels || [];
    // Chuẩn bị dữ liệu cho biểu đồ grouped bar
    const topHotelsRevenueData = topHotels.length > 0
        ? topHotels.map((hotel: any) => hotel?.totalRevenue || 0)
        : [];

    const topHotelsBookingsData = topHotels.length > 0
        ? topHotels.map((hotel: any) => hotel?.totalBookings || 0)
        : [];

    // Biểu đồ top hotels với cả doanh thu và số lượng bookings (grouped bar chart)
    const topHotelsOptions: ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            stacked: false, // Quan trọng: không stack để hiển thị grouped bars
        },
        xaxis: {
            categories: topHotels.length > 0
                ? topHotels.map((hotel: any) => hotel?.hotelName || 'N/A')
                : [],
            title: { text: 'Khách sạn' },
        },
        yaxis: [
            {
                title: { text: 'Doanh thu (VND)' },
                labels: {
                    formatter: (val: number) => {
                        if (val >= 1_000_000_000) {
                            return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
                        } else if (val >= 1_000_000) {
                            return `${(val / 1_000_000).toFixed(0)} triệu`;
                        }
                        return val.toLocaleString('vi-VN');
                    },
                },
            },
            {
                opposite: true,
                title: { text: 'Số lượng đặt phòng' },
            },
        ],
        colors: ['#2563eb', '#10b981'],
        dataLabels: {
            enabled: false, // Tắt để tránh rối
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                borderRadius: 4,
            },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center',
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 0) {
                        // Doanh thu
                        if (val >= 1_000_000_000) {
                            return `Doanh thu: ${(val / 1_000_000_000).toFixed(2)} tỷ VND`;
                        } else if (val >= 1_000_000) {
                            return `Doanh thu: ${(val / 1_000_000).toFixed(1)} triệu VND`;
                        }
                        return `Doanh thu: ${val.toLocaleString('vi-VN')} VND`;
                    } else {
                        // Số lượng đặt phòng
                        return `Số lượng đặt phòng: ${Math.round(val)}`;
                    }
                },
            },
        },
    };

    const topHotelsSeries = [
        {
            name: 'Doanh thu',
            data: topHotelsRevenueData,
        },
        {
            name: 'Số lượng đặt phòng',
            data: topHotelsBookingsData,
        },
    ];

    // Chart options cho doanh thu 7 ngày qua
    const revenueChartData = revenueData
        ? (('currentPeriod' in revenueData && revenueData.currentPeriod?.data)
            ? revenueData.currentPeriod.data
            : ('data' in revenueData ? revenueData.data : []))
        : [];
    console.log('[SuperAdminDashboard] Revenue chart data:', {
        revenueData: revenueData,
        revenueChartData: revenueChartData,
        dataLength: revenueChartData.length,
        sampleData: revenueChartData[0]
    });

    const revenueChartOptions: ApexOptions = {
        chart: {
            type: 'line',
            toolbar: { show: false },
        },
        xaxis: {
            categories: revenueChartData.map((item: any) => {
                const date = new Date(item.period);
                return `${date.getDate()}/${date.getMonth() + 1}`;
            }),
            title: { text: 'Ngày' },
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
                    return val.toLocaleString('vi-VN');
                },
            },
        },
        colors: ['#2563eb'],
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 5 },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            y: {
                formatter: (val: number) => {
                    if (val >= 1_000_000_000) {
                        return `${(val / 1_000_000_000).toFixed(2)} tỷ VND`;
                    } else if (val >= 1_000_000) {
                        return `${(val / 1_000_000).toFixed(1)} triệu VND`;
                    }
                    return `${val.toLocaleString('vi-VN')} VND`;
                },
            },
        },
    };

    const revenueChartSeries = [{
        name: 'Doanh thu',
        data: revenueChartData.map((item: any) => item.revenue || 0),
    }];

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-4 text-dark">Dashboard Super Admin</h1>

            {/* Hàng thẻ thống kê */}
            <div className="row g-4 mb-4">
                <div className="col-xl-3 col-md-6">
                    <StatCard
                        title="Tổng số khách sạn"
                        value={(data.ecosystemGrowth?.totalActiveHotels ?? 0).toLocaleString('vi-VN')}
                        icon={FaHotel}
                        variant="primary"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <StatCard
                        title="Người dùng mới hôm nay"
                        value={(data.ecosystemGrowth?.newUsersToday ?? 0).toLocaleString('vi-VN')}
                        icon={FaUsers}
                        variant="success"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <StatCard
                        title="Doanh thu hôm nay"
                        value={(() => {
                            // Ưu tiên lấy từ financials report, nếu không có thì lấy từ dashboard summary
                            let revenue = 0;
                            if (financialsData?.today) {
                                const todayData = ('currentPeriod' in financialsData.today && financialsData.today.currentPeriod?.summary)
                                    ? financialsData.today.currentPeriod.summary
                                    : financialsData.today?.summary;

                                // Lấy từ summary trước
                                revenue = todayData?.totalGrossRevenue ?? 0;

                                // Nếu summary = 0, tính tổng từ data array
                                if (revenue === 0) {
                                    const dataArray = ('currentPeriod' in financialsData.today && financialsData.today.currentPeriod?.data)
                                        ? financialsData.today.currentPeriod.data
                                        : (financialsData.today?.data || []);
                                    revenue = dataArray.reduce((sum: number, item: any) => {
                                        return sum + (item?.grossRevenue || 0);
                                    }, 0);
                                }
                            } else {
                                revenue = data.realtimeFinancials?.todayRevenue ?? 0;
                            }
                            console.log('[SuperAdminDashboard] Today revenue:', revenue, {
                                fromFinancials: !!financialsData?.today,
                                fromDashboard: !financialsData?.today
                            });
                            if (revenue >= 1_000_000_000) {
                                return `${(revenue / 1_000_000_000).toFixed(2)} tỷ`;
                            } else if (revenue >= 1_000_000) {
                                return `${(revenue / 1_000_000).toFixed(1)} triệu`;
                            } else if (revenue >= 1_000) {
                                return `${(revenue / 1_000).toFixed(0)} nghìn`;
                            }
                            return `${revenue.toLocaleString('en-US')} VND`;
                        })()}
                        icon={FaDollarSign}
                        variant="warning"
                        tooltip="Tổng doanh thu từ các bookings đã checkout hôm nay (status = COMPLETED)"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <StatCard
                        title="Đối tác hệ thống"
                        value={(() => {
                            const totalPartners = ('currentPeriod' in (usersData || {}) && (usersData as any).currentPeriod?.platformTotals?.totalPartners)
                                ? (usersData as any).currentPeriod.platformTotals.totalPartners
                                : ((usersData as any)?.platformTotals?.totalPartners ?? 0);
                            return totalPartners.toLocaleString('vi-VN');
                        })()}
                        icon={FaUsers}
                        variant="primary"
                    />
                </div>
            </div>

            {/* Hàng thẻ thống kê tháng */}
            <div className="row g-4 mb-4">
                <div className="col-xl-4 col-md-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title text-muted">
                                Doanh thu tháng này (gross)
                                <i className="bi bi-info-circle ms-2 text-muted"
                                    style={{ fontSize: '0.875rem', cursor: 'help' }}
                                    title="Tổng doanh thu gộp từ đầu tháng đến hôm nay (từ SystemDailyReport + hôm nay)"></i>
                            </h5>
                            <h3 className="text-primary">
                                {(() => {
                                    // Ưu tiên lấy từ financials report, nếu không có thì lấy từ dashboard summary
                                    let revenue = 0;
                                    if (financialsData?.month) {
                                        const monthData = ('currentPeriod' in financialsData.month && financialsData.month.currentPeriod?.summary)
                                            ? financialsData.month.currentPeriod.summary
                                            : financialsData.month?.summary;

                                        // Lấy từ summary trước
                                        revenue = monthData?.totalGrossRevenue ?? 0;

                                        // Nếu summary = 0, tính tổng từ data array
                                        if (revenue === 0) {
                                            const dataArray = ('currentPeriod' in financialsData.month && financialsData.month.currentPeriod?.data)
                                                ? financialsData.month.currentPeriod.data
                                                : (financialsData.month?.data || []);
                                            revenue = dataArray.reduce((sum: number, item: any) => {
                                                return sum + (item?.grossRevenue || 0);
                                            }, 0);
                                        }
                                    } else {
                                        revenue = (data.aggregatedFinancials?.mtdGrossRevenue ?? 0) + (data.realtimeFinancials?.todayRevenue ?? 0);
                                    }
                                    console.log('[SuperAdminDashboard] MTD Gross Revenue:', {
                                        fromFinancials: !!financialsData?.month,
                                        fromDashboard: !financialsData?.month,
                                        revenue: revenue
                                    });
                                    if (revenue >= 1_000_000_000) {
                                        return `${(revenue / 1_000_000_000).toFixed(2)} tỷ`;
                                    } else if (revenue >= 1_000_000) {
                                        return `${(revenue / 1_000_000).toFixed(1)} triệu`;
                                    } else if (revenue >= 1_000) {
                                        return `${(revenue / 1_000).toFixed(0)} nghìn`;
                                    }
                                    return `${revenue.toLocaleString('en-US')} VND`;
                                })()}
                            </h3>
                            <small className="text-muted">Tổng tiền khách hàng trả từ đầu tháng</small>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 col-md-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title text-muted">
                                Doanh thu tháng này (net)
                                <i className="bi bi-info-circle ms-2 text-muted"
                                    style={{ fontSize: '0.875rem', cursor: 'help' }}
                                    title="Doanh thu ròng = Doanh thu gộp × Tỷ lệ hoa hồng. Phần tiền Holidate thực sự thu về sau khi trừ phần trả cho đối tác."></i>
                            </h5>
                            <h3 className="text-success">
                                {(() => {
                                    // Ưu tiên lấy từ financials report, nếu không có thì lấy từ dashboard summary
                                    let revenue = 0;
                                    if (financialsData?.month) {
                                        const monthData = ('currentPeriod' in financialsData.month && financialsData.month.currentPeriod?.summary)
                                            ? financialsData.month.currentPeriod.summary
                                            : financialsData.month?.summary;

                                        // Lấy từ summary trước
                                        revenue = monthData?.totalNetRevenue ?? 0;

                                        // Nếu summary = 0, tính tổng từ data array
                                        if (revenue === 0) {
                                            const dataArray = ('currentPeriod' in financialsData.month && financialsData.month.currentPeriod?.data)
                                                ? financialsData.month.currentPeriod.data
                                                : (financialsData.month?.data || []);
                                            revenue = dataArray.reduce((sum: number, item: any) => {
                                                return sum + (item?.netRevenue || 0);
                                            }, 0);
                                        }
                                    } else {
                                        revenue = (data.aggregatedFinancials?.mtdNetRevenue ?? 0) + (data.realtimeFinancials?.todayRevenue ?? 0);
                                    }
                                    console.log('[SuperAdminDashboard] MTD Net Revenue:', {
                                        fromFinancials: !!financialsData?.month,
                                        fromDashboard: !financialsData?.month,
                                        revenue: revenue
                                    });
                                    if (revenue >= 1_000_000_000) {
                                        return `${(revenue / 1_000_000_000).toFixed(2)} tỷ`;
                                    } else if (revenue >= 1_000_000) {
                                        return `${(revenue / 1_000_000).toFixed(1)} triệu`;
                                    } else if (revenue >= 1_000) {
                                        return `${(revenue / 1_000).toFixed(0)} nghìn`;
                                    }
                                    return `${revenue.toLocaleString('en-US')} VND`;
                                })()}
                            </h3>
                            <small className="text-muted">Phần Holidate thu về (sau khi trừ hoa hồng)</small>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 col-md-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title text-muted">Đối tác mới hôm nay</h5>
                            <h3 className="text-info">
                                {(data.ecosystemGrowth?.newPartnersToday ?? 0).toLocaleString('vi-VN')}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="row g-4 mb-4">
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title">Doanh thu 7 ngày qua</h5>
                            {revenueChartData.length > 0 ? (
                                <Chart
                                    options={revenueChartOptions}
                                    series={revenueChartSeries}
                                    type="line"
                                    height={300}
                                />
                            ) : (
                                <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                                    <p className="text-muted">Không có dữ liệu để hiển thị</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title">Top 5 khách sạn hoạt động tốt nhất (7 ngày qua)</h5>
                            {topHotels.length > 0 ? (
                                <Chart
                                    options={topHotelsOptions}
                                    series={topHotelsSeries}
                                    type="bar"
                                    height={300}
                                />
                            ) : (
                                <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                                    <div className="text-center">
                                        <p className="text-muted mb-0">Không có dữ liệu khách sạn để hiển thị</p>
                                        <small className="text-muted">Cần có bookings trong 7 ngày qua để hiển thị biểu đồ</small>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}