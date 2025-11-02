// components/Admin/SuperAdminDashboard/RevenueChart.tsx
"use client";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RevenueChartProps {
    data: { month: string, revenue: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    const chartData = {
        labels: data.map(d => d.month),
        datasets: [{
            label: 'Doanh thu (triệu VND)',
            data: data.map(d => d.revenue),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };
    const options = { responsive: true, plugins: { legend: { display: false } } };

    return (
        <div className="card shadow-sm h-100">
            <div className="card-body">
                <h5 className="card-title">Báo cáo doanh thu 6 tháng gần nhất</h5>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}