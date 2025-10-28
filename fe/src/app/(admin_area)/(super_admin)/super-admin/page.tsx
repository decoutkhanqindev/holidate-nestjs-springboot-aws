"use client";
import { useEffect, useState } from "react";
import StatCard from "@/components/AdminSuper/SuperAdminDashboard/StatCard";
import RevenueChart from "@/components/AdminSuper/SuperAdminDashboard/RevenueChart";
import UserDistributionChart from "@/components/AdminSuper/SuperAdminDashboard/UserDistributionChart";
import { getSuperAdminDashboardData } from "@/lib/Super_Admin/SuperAdminService";
import { FaHotel, FaUsers, FaDollarSign, FaExclamationTriangle } from "react-icons/fa";

// Định nghĩa kiểu cho dữ liệu dashboard
type DashboardData = Awaited<ReturnType<typeof getSuperAdminDashboardData>>;

export default function SuperAdminHomePage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const dashboardData = await getSuperAdminDashboardData();
            setData(dashboardData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading || !data) {
        return <div className="text-center p-5">Đang tải dữ liệu dashboard...</div>;
    }

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-4 text-dark">Dashboard Super Admin</h1>

            {/* Hàng thẻ thống kê */}
            <div className="row g-4 mb-4">
                <div className="col-xl-3 col-md-6">
                    <StatCard
                        title="Tổng số khách sạn"
                        value={data.stats.totalHotels.toLocaleString('vi-VN')}
                        icon={FaHotel}
                        variant="primary"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <StatCard
                        title="Tổng số người dùng"
                        value={data.stats.totalUsers.toLocaleString('vi-VN')}
                        icon={FaUsers}
                        variant="success"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <StatCard
                        title="Tổng doanh thu"
                        value={`${(data.stats.totalRevenue / 1_000_000_000).toFixed(2)} tỷ`}
                        icon={FaDollarSign}
                        variant="warning"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <StatCard
                        title="Ticket chờ xử lý"
                        value={data.stats.pendingTickets.toString()}
                        icon={FaExclamationTriangle}
                        variant="danger"
                    />
                </div>
            </div>

            {/* Hàng biểu đồ */}
            <div className="row g-4">
                <div className="col-lg-8">
                    <RevenueChart data={data.revenueByMonth} />
                </div>
                <div className="col-lg-4">
                    <UserDistributionChart data={data.userDistribution} />
                </div>
            </div>
        </div>
    );
}