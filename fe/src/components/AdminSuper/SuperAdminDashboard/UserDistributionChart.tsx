// components/Admin/SuperAdminDashboard/UserDistributionChart.tsx
"use client";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface UserDistributionChartProps {
    data: { superAdmins: number, hotelAdmins: number, customers: number };
}

export default function UserDistributionChart({ data }: UserDistributionChartProps) {
    const chartData = {
        labels: ['Super Admins', 'Hotel Admins', 'Khách hàng'],
        datasets: [{
            data: [data.superAdmins, data.hotelAdmins, data.customers],
            backgroundColor: ['#dc3545', '#ffc107', '#0d6efd'],
        }],
    };
    const options = { responsive: true, plugins: { legend: { position: 'bottom' as const } } };

    return (
        <div className="card shadow-sm h-100">
            <div className="card-body">
                <h5 className="card-title">Phân bổ người dùng</h5>
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
}