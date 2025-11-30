"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import { getPartnerDashboardSummary } from '@/lib/PartnerAPI/partnerDashboardService';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import { getRoomsByHotelId } from '@/lib/AdminAPI/roomService';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashboardPage() {
    const { effectiveUser } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [roomsData, setRoomsData] = useState<any>(null); // Data từ API rooms để so sánh
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedHotelId, setSelectedHotelId] = useState<string>('');
    const [hotelsList, setHotelsList] = useState<any[]>([]); // Danh sách hotels của partner
    const [reloadKey, setReloadKey] = useState(0); // Key để force reload

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

                // Lưu danh sách hotels
                setHotelsList(hotelsData.hotels);

                // Nếu chưa chọn hotel, lấy hotel đầu tiên
                // Nếu đã chọn hotel, giữ nguyên (để user có thể chọn hotel khác)
                let currentHotel = hotelsData.hotels[0];
                if (selectedHotelId) {
                    const foundHotel = hotelsData.hotels.find((h: any) => h.id === selectedHotelId);
                    if (foundHotel) {
                        currentHotel = foundHotel;
                    }
                }

                console.log('[DashboardPage] Loading dashboard for hotel:', {
                    hotelId: currentHotel.id,
                    hotelName: currentHotel.name,
                    totalHotels: hotelsData.hotels.length,
                    allHotels: hotelsData.hotels.map((h: any) => ({ id: h.id, name: h.name }))
                });

                setSelectedHotelId(currentHotel.id);

                // Fetch rooms từ API TRƯỚC (chính xác nhất) - thêm timestamp để tránh cache
                try {
                    const roomsResponse = await getRoomsByHotelId(currentHotel.id, 0, 1000);

                    // Tính tổng số phòng từ API rooms
                    const totalRoomsFromAPI = (roomsResponse.rooms || []).reduce((total: number, room: any) => {
                        return total + (room.totalRooms || room.quantity || 0);
                    }, 0);

                    console.log('[DashboardPage] Rooms API data (CHÍNH XÁC):', {
                        hotelId: currentHotel.id,
                        hotelName: currentHotel.name,
                        roomsCount: roomsResponse.rooms?.length || 0,
                        totalRoomsFromAPI: totalRoomsFromAPI,
                        roomsBreakdown: (roomsResponse.rooms || []).map((room: any) => ({
                            name: room.name,
                            totalRooms: room.totalRooms || room.quantity || 0,
                            status: room.status
                        }))
                    });

                    setRoomsData({
                        rooms: roomsResponse.rooms || [],
                        totalRooms: totalRoomsFromAPI
                    });
                } catch (roomsErr: any) {
                    // Không throw error, vẫn tiếp tục với Dashboard API
                }

                // Load dashboard data - thêm timestamp để tránh cache
                const data = await getPartnerDashboardSummary(currentHotel.id, 7);

                // Log chi tiết để debug
                const totalRooms = (data?.roomStatusCounts || []).reduce((total: number, item: any) => total + (item.count || 0), 0);
                console.log('[DashboardPage] Dashboard API data (có thể chưa cập nhật):', {
                    hotelId: currentHotel.id,
                    hotelName: currentHotel.name,
                    roomStatusCounts: data?.roomStatusCounts,
                    totalRooms: totalRooms,
                    totalRoomCapacity: data?.totalRoomCapacity,
                    note: 'Dashboard API có thể trả về số phòng cũ. Sử dụng Rooms API làm nguồn chính xác.'
                });

                // So sánh với rooms API (sẽ được so sánh sau khi roomsData được set)

                // Cảnh báo nếu số phòng không khớp
                if (data?.totalRoomCapacity && totalRooms !== data.totalRoomCapacity) {
                    console.warn('[DashboardPage] WARNING: Total rooms mismatch!', {
                        fromRoomStatusCounts: totalRooms,
                        fromTotalRoomCapacity: data.totalRoomCapacity,
                        difference: Math.abs(totalRooms - data.totalRoomCapacity)
                    });
                }

                setDashboardData(data);
            } else {
                // ADMIN có thể xem tất cả, nhưng API yêu cầu hotelId
                // Tạm thời bỏ qua hoặc lấy hotel đầu tiên
                setError('Vui lòng chọn khách sạn để xem dashboard.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, [effectiveUser, reloadKey]);

    // Refresh data khi trang được focus lại (sau khi thêm phòng ở tab khác)
    useEffect(() => {
        const handleFocus = () => {
            setReloadKey(prev => prev + 1);
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

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

    // Ưu tiên dùng số phòng từ Rooms API (chính xác nhất), sau đó mới dùng Dashboard API
    const actualTotalCapacity = roomsData?.totalRooms || dashboardData?.totalRoomCapacity || totalRoomCapacityFromStatus;

    // Tính số phòng còn trống cho mỗi ngày: totalCapacity - roomsBooked
    const availableRoomsData = occupancyForecast.length > 0
        ? occupancyForecast.map((item: any) => {
            // Ưu tiên: Rooms API > totalCapacity từ item > totalRoomCapacityFromStatus
            const totalCapacity = item.totalCapacity ?? actualTotalCapacity;
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0 text-dark">Trang tổng quan</h1>
                <div className="d-flex gap-2 align-items-center">
                    {/* Dropdown chọn hotel nếu có nhiều hotel */}
                    {hotelsList.length > 1 && (
                        <select
                            className="form-select"
                            value={selectedHotelId}
                            onChange={(e) => {
                                setSelectedHotelId(e.target.value);
                                setReloadKey(prev => prev + 1); // Trigger reload
                            }}
                            style={{ minWidth: '250px' }}
                        >
                            {hotelsList.map((hotel: any) => (
                                <option key={hotel.id} value={hotel.id}>
                                    {hotel.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {/* Hiển thị hotel hiện tại nếu chỉ có 1 hotel */}
                    {hotelsList.length === 1 && (
                        <span className="text-muted">
                            <i className="bi bi-building me-1"></i>
                            {hotelsList[0]?.name}
                        </span>
                    )}
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => {
                            setReloadKey(prev => prev + 1);
                        }}
                        disabled={isLoading}
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        {isLoading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                </div>
            </div>

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
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Thông tin phòng hiện tại</h5>
                    <button
                        className="btn btn-sm btn-light"
                        onClick={() => {
                            setReloadKey(prev => prev + 1);
                        }}
                        title="Làm mới dữ liệu phòng"
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
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
                        {(dashboardData?.roomStatusCounts || []).length === 0 && (
                            <span className="text-muted">Chưa có dữ liệu phòng</span>
                        )}
                    </div>
                    <div className="mt-3">
                        {/* Ưu tiên hiển thị số phòng từ Rooms API (chính xác nhất) */}
                        {roomsData?.totalRooms ? (
                            <p className="mb-1">
                                <strong>Tổng số phòng (chính xác):</strong> <span className="text-success fw-bold fs-5">{roomsData.totalRooms}</span> phòng
                            </p>
                        ) : (
                            <p className="mb-1">
                                <strong>Tổng số phòng (từ Dashboard API):</strong> {
                                    (() => {
                                        const totalFromStatus = (dashboardData?.roomStatusCounts || []).reduce((total: number, item: any) => total + (item.count || 0), 0);
                                        return totalFromStatus;
                                    })()
                                } phòng
                            </p>
                        )}

                        {/* Hiển thị thông tin so sánh nếu có cả 2 nguồn */}
                        {roomsData?.totalRooms && (() => {
                            const totalFromStatus = (dashboardData?.roomStatusCounts || []).reduce((total: number, item: any) => total + (item.count || 0), 0);
                            if (totalFromStatus !== roomsData.totalRooms) {
                                return (
                                    <p className="mb-1 text-muted small">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Dashboard API: {totalFromStatus} phòng (có thể chưa cập nhật)
                                    </p>
                                );
                            }
                            return null;
                        })()}

                        {dashboardData?.totalRoomCapacity && (
                            <p className="mb-0 text-muted small">
                                <i className="bi bi-info-circle me-1"></i>
                                Tổng capacity (chỉ active): {dashboardData.totalRoomCapacity} phòng
                            </p>
                        )}
                        {(() => {
                            const totalFromStatus = (dashboardData?.roomStatusCounts || []).reduce((total: number, item: any) => total + (item.count || 0), 0);
                            const totalFromCapacity = dashboardData?.totalRoomCapacity || 0;

                            if (totalFromCapacity > 0 && totalFromStatus !== totalFromCapacity) {
                                return (
                                    <small className="text-info d-block mt-2">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Lưu ý: Tổng từ trạng thái ({totalFromStatus}) bao gồm tất cả status.
                                        Tổng capacity ({totalFromCapacity}) chỉ tính phòng active.
                                    </small>
                                );
                            }
                            return null;
                        })()}
                        {(() => {
                            const totalFromStatus = (dashboardData?.roomStatusCounts || []).reduce((total: number, item: any) => total + (item.count || 0), 0);
                            const totalFromRoomsAPI = roomsData?.totalRooms || 0;

                            // So sánh và cảnh báo nếu có mismatch
                            if (totalFromRoomsAPI > 0 && totalFromStatus !== totalFromRoomsAPI) {
                                return (
                                    <div className="alert alert-danger mt-2 mb-0" style={{ fontSize: '0.875rem' }}>
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        <strong>Lỗi phát hiện:</strong> Số phòng từ Dashboard API ({totalFromStatus}) không khớp với Rooms API ({totalFromRoomsAPI}).
                                        <br />
                                        <small>
                                            <strong>Nguyên nhân có thể:</strong>
                                            <ul className="mb-0 mt-1" style={{ paddingLeft: '1.5rem' }}>
                                                <li>Backend query <code>GET_ROOM_STATUS_COUNTS</code> đang trả về sai</li>
                                                <li>Có phòng mới được thêm nhưng query chưa cập nhật</li>
                                                <li>Xem Console logs để xem breakdown chi tiết</li>
                                            </ul>
                                            <strong>Giải pháp:</strong> Sử dụng số phòng từ Rooms API ({totalFromRoomsAPI}) làm số chính xác.
                                        </small>
                                    </div>
                                );
                            }

                            // Cảnh báo nếu tổng số phòng < 10 và không có roomsData để so sánh
                            if (totalFromStatus > 0 && totalFromStatus < 10 && !totalFromRoomsAPI) {
                                return (
                                    <div className="alert alert-warning mt-2 mb-0" style={{ fontSize: '0.875rem' }}>
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        <strong>Cảnh báo:</strong> Tổng số phòng hiển thị ({totalFromStatus}) có vẻ thấp.
                                        <br />
                                        <small>Vui lòng kiểm tra backend query hoặc xem Console logs để xem breakdown chi tiết.</small>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
