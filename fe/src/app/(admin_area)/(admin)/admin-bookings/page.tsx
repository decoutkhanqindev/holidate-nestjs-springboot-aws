import { PageHeader } from '@/components/Admin/ui/PageHeader';

export default function AdminBookingsPage() {
    return (
        <div className="container-fluid">
            <PageHeader title={<span style={{ color: '#2563eb', fontWeight: 700, fontSize: '2rem' }}>Quản lý đặt phòng</span>} />
            {/* Thống kê đặt phòng */}
            <div className="row mt-4">
                <div className="col-md-6 mb-3">
                    <div className="card h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">Thống kê trạng thái đặt phòng</h5>
                            {/* Biểu đồ hình tròn (doughnut) */}
                            <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
                                <span style={{ color: '#aaa' }}>Biểu đồ trạng thái đặt phòng (doughnut)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <div className="card h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">Thống kê theo thời gian</h5>
                            {/* Biểu đồ đường (line chart) */}
                            <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
                                <span style={{ color: '#aaa' }}>Biểu đồ số lượng đặt phòng theo ngày (line chart)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Bản đồ thống kê */}
            <div className="card mb-4">
                <div className="card-header bg-primary text-white">Bản đồ thống kê đặt phòng</div>
                <div className="card-body p-0">
                    <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                        <span style={{ color: '#aaa' }}>Bản đồ phân bố đặt phòng (map chart)</span>
                    </div>
                </div>
            </div>
            {/* Danh sách đặt phòng */}
            <div className="card mb-4">
                <div className="card-header bg-info text-white">Danh sách đặt phòng</div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0">
                            <thead>
                                <tr>
                                    <th>Mã đặt phòng</th>
                                    <th>Tên khách hàng</th>
                                    <th>Khách sạn</th>
                                    <th>Ngày nhận phòng</th>
                                    <th>Ngày trả phòng</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>BK001</td>
                                    <td>Nguyễn Văn A</td>
                                    <td>Grand Saigon</td>
                                    <td>01/10/2025</td>
                                    <td>05/10/2025</td>
                                    <td><span className="badge bg-success">Đã xác nhận</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-primary me-2">Sửa</button>
                                        <button className="btn btn-sm btn-danger">Xóa</button>
                                    </td>
                                </tr>
                                {/* Thêm các dòng dữ liệu khác nếu cần */}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
