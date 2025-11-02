"use client";
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function BookingCharts() {
    // Chart 1: Doughnut (Pie)
    const pieOptions: ApexOptions = {
        chart: { type: 'donut' },
        labels: ['Đã đặt', 'Đang xử lý', 'Đã hủy', 'Chờ xác nhận'],
        colors: ['#2563eb', '#f59e42', '#ef4444', '#10b981'],
        legend: { position: 'bottom' },
    };
    const pieSeries: number[] = [44, 23, 12, 21];

    // Chart 2: Line
    const lineOptions: ApexOptions = {
        chart: { type: 'line' },
        xaxis: { categories: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] },
        colors: ['#2563eb'],
    };
    const lineSeries: { name: string; data: number[] }[] = [
        { name: 'Chi phí', data: [120, 200, 150, 80, 70, 110, 130] }
    ];

    // Chart 3: Bar
    const barOptions: ApexOptions = {
        chart: { type: 'bar' },
        xaxis: { categories: ['Hà Nội', 'Đà Nẵng', 'HCM', 'Huế', 'Cần Thơ'] },
        colors: ['#2563eb'],
    };
    const barSeries: { name: string; data: number[] }[] = [
        { name: 'Số lượng đặt', data: [30, 40, 45, 20, 25] }
    ];

    return (
        <div className="row mt-4">
            <div className="col-md-4 mb-3">
                <div className="card h-100 shadow">
                    <div className="card-body">
                        <h5 className="card-title">Thống kê trạng thái đặt phòng</h5>
                        <Chart options={pieOptions} series={pieSeries} type="donut" height={220} />
                    </div>
                </div>
            </div>
            <div className="col-md-4 mb-3">
                <div className="card h-100 shadow">
                    <div className="card-body">
                        <h5 className="card-title">Thống kê chi phí</h5>
                        <Chart options={lineOptions} series={lineSeries} type="line" height={220} />
                    </div>
                </div>
            </div>
            <div className="col-md-4 mb-3">
                <div className="card h-100 shadow">
                    <div className="card-body">
                        <h5 className="card-title">Bản đồ thống kê đặt phòng</h5>
                        <Chart options={barOptions} series={barSeries} type="bar" height={220} />
                    </div>
                </div>
            </div>
        </div>
    );
}
