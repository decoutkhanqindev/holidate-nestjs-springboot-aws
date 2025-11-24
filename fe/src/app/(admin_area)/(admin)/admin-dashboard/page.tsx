"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import { getPartnerDashboardSummary } from '@/lib/PartnerAPI/partnerDashboardService';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashboardPage() {
    const { effectiveUser } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedHotelId, setSelectedHotelId] = useState<string>('');

    useEffect(() => {
        const loadDashboard = async () => {
            if (!effectiveUser) return;

            setIsLoading(true);
            setError(null);

            try {
                const userId = effectiveUser.id;
                const roleName = effectiveUser.role?.name;

                // Nếu là PARTNER, cần lấy hotels của họ trước
                if (roleName?.toLowerCase() === 'partner') {
                    const hotelsData = await getHotels(0, 1000, undefined, undefined, userId, roleName);
                    
                    if (hotelsData.hotels.length === 0) {
                        setError('Bạn chưa có khách sạn nào. Vui lòng tạo khách sạn trước.');
                        setIsLoading(false);
                        return;
                    }

                    // Lấy hotel đầu tiên
                    const firstHotel = hotelsData.hotels[0];
                    setSelectedHotelId(firstHotel.id);

                    // Load dashboard data
                    const data = await getPartnerDashboardSummary(firstHotel.id, 7);
                    setDashboardData(data);
                } else {
                    // ADMIN có thể xem tất cả, nhưng API yêu cầu hotelId
                    // Tạm thời bỏ qua hoặc lấy hotel đầu tiên
                    setError('Vui lòng chọn khách sạn để xem dashboard.');
                }
            } catch (err: any) {
                console.error('[DashboardPage] Error:', err);
                setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, [effectiveUser]);

    if (isLoading) {
        return (
            <div className="container-fluid">
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3">Đang tải dữ liệu dashboard...</p>
                </div>
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

    if (!dashboardData) {
        return (
            <div className="container-fluid">
                <div className="alert alert-info" role="alert">
                    Không có dữ liệu để hiển thị.
                </div>
            </div>
        );
    }

    // Chart options cho số phòng còn trống
    const occupancyForecast = dashboardData?.occupancyForecast || [];
    
    // Tính tổng số phòng từ roomStatusCounts (fallback nếu totalCapacity không có)
    const totalRoomCapacityFromStatus = (dashboardData?.roomStatusCounts || []).reduce((total: number, item: any) => total + (item.count || 0), 0);
    
    // Tính số phòng còn trống cho mỗi ngày: totalCapacity - roomsBooked
    const availableRoomsData = occupancyForecast.length > 0 
        ? occupancyForecast.map((item: any) => {
            // Sử dụng totalCapacity từ item, nếu không có thì dùng tổng từ roomStatusCounts
            const totalCapacity = item.totalCapacity ?? totalRoomCapacityFromStatus;
            const roomsBooked = item.roomsBooked || 0;
            const available = Math.max(0, totalCapacity - roomsBooked);
            return available;
        })
        : [];
    
    // Debug: Log để kiểm tra dữ liệu
    if (process.env.NODE_ENV === 'development') {
        console.log('Dashboard Data:', {
            occupancyForecast,
            totalRoomCapacityFromStatus,
            availableRoomsData,
            roomStatusCounts: dashboardData?.roomStatusCounts
        });
    }
    
    const availableRoomsChartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            animations: {
                enabled: true,
            },
        },
        xaxis: {
            categories: occupancyForecast.length > 0 
                ? occupancyForecast.map((item: any) => {
                    try {
                        const date = new Date(item.date);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                    } catch (e) {
                        return item.date || '';
                    }
                })
                : [],
            title: { text: 'Ngày' },
        },
        yaxis: {
            title: { text: 'Số phòng còn trống' },
            min: 0,
        },
        colors: ['#10b981'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '60%',
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => Math.round(val).toString(),
        },
        tooltip: {
            y: { 
                formatter: (val: number) => `${Math.round(val)} phòng còn trống`,
            },
        },
    };

    const availableRoomsChartSeries = [{
        name: 'Số phòng còn trống',
        data: availableRoomsData,
    }];

    // Chart options cho booking status
    const bookingStatusCounts = dashboardData?.bookingStatusCounts || [];
    const bookingStatusOptions: ApexOptions = {
        chart: { type: 'donut' },
        labels: bookingStatusCounts.map((item: any) => {
            const statusMap: { [key: string]: string } = {
                'pending_payment': 'Chờ thanh toán',
                'confirmed': 'Đã xác nhận',
                'checked_in': 'Đã check-in',
                'cancelled': 'Đã hủy',
                'completed': 'Hoàn thành',
                'rescheduled': 'Đã đổi lịch',
            };
            return statusMap[item.status] || item.status;
        }),
        colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
        legend: { position: 'bottom' },
    };

    const bookingStatusSeries = bookingStatusCounts.map((item: any) => item.count || 0);

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-4 text-dark">Trang tổng quan</h1>

            {/* Thẻ thống kê hôm nay */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card text-white bg-info h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">{dashboardData?.todaysActivity?.checkInsToday || 0}</h5>
                            <p className="card-text">Check-in hôm nay</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-warning h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">{dashboardData?.todaysActivity?.checkOutsToday || 0}</h5>
                            <p className="card-text">Check-out hôm nay</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-success h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">{dashboardData?.todaysActivity?.inHouseGuests || 0}</h5>
                            <p className="card-text">Khách đang ở</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="row g-4 mb-4">
                <div className="col-lg-6">
                    <div className="card h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">Số phòng còn trống (7 ngày tới)</h5>
                            {occupancyForecast.length > 0 && availableRoomsData.length > 0 ? (
                                <Chart
                                    options={availableRoomsChartOptions}
                                    series={availableRoomsChartSeries}
                                    type="bar"
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
                    <div className="card h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">Thống kê trạng thái đặt phòng</h5>
                            <Chart
                                options={bookingStatusOptions}
                                series={bookingStatusSeries}
                                type="donut"
                                height={300}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông tin phòng */}
            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Thông tin phòng hiện tại</h5>
                </div>
                <div className="card-body">
                    <div className="d-flex flex-wrap gap-2">
                        {(dashboardData?.roomStatusCounts || []).map((item: any, index: number) => {
                            const statusMap: { [key: string]: { label: string; color: string } } = {
                                'active': { label: 'Đang hoạt động', color: 'success' },
                                'inactive': { label: 'Không hoạt động', color: 'secondary' },
                                'maintenance': { label: 'Bảo trì', color: 'warning' },
                                'closed': { label: 'Đã đóng', color: 'danger' },
                            };
                            const statusInfo = statusMap[item.status] || { label: item.status, color: 'secondary' };
                            return (
                                <span key={index} className={`badge bg-${statusInfo.color}`}>
                                    {item.count} : {statusInfo.label}
                                </span>
                            );
                        })}
                    </div>
                    <p className="mt-3 mb-0">
                        <strong>Tổng số phòng:</strong> {
                            (dashboardData?.roomStatusCounts || []).reduce((total: number, item: any) => total + (item.count || 0), 0)
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
