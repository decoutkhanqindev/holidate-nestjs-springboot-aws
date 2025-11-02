// src/app/(admin)/dashboard/page.tsx
import { PageHeader } from '@/components/Admin/ui/PageHeader';
import { BookingCharts } from '@/components/Admin/BookingCharts';

export default function DashboardPage() {
    return (
        <div className="container-fluid">

            <PageHeader title={<span style={{ color: '#2563eb', fontWeight: 700, fontSize: '2rem' }}>Trang tổng quan</span>} />

            <BookingCharts />

            <div className="row mt-4">
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-info h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">0</h5>
                            <p className="card-text">Số HĐ đến hạn checkin</p>
                        </div>
                        <div className="card-footer text-center">
                            <a href="#" className="text-white">Chi tiết <i className="bi bi-arrow-right-circle"></i></a>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-info h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">0</h5>
                            <p className="card-text">Sinh nhật khách hàng</p>
                        </div>
                        <div className="card-footer text-center">
                            <a href="#" className="text-white">Chi tiết <i className="bi bi-arrow-right-circle"></i></a>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-danger h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">6</h5>
                            <p className="card-text">Hợp đồng thuê sắp hết hạn</p>
                        </div>
                        <div className="card-footer text-center">
                            <a href="#" className="text-white">Chi tiết <i className="bi bi-arrow-right-circle"></i></a>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-danger h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">1</h5>
                            <p className="card-text">VISA sắp hết hạn</p>
                        </div>
                        <div className="card-footer text-center">
                            <a href="#" className="text-white">Chi tiết <i className="bi bi-arrow-right-circle"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            {/* ...existing code... */}
            {/* Thông tin phòng hiện tại */}
            <div className="card my-4">
                <div className="card-body">
                    <h5 className="card-title">Thông tin phòng hiện tại</h5>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="badge bg-primary">34 : Trống</span>
                        <span className="badge bg-success">21 : Đang ở</span>
                        <span className="badge bg-purple">3 : Đặt cọc</span>
                        <span className="badge bg-warning text-dark">0 : Sắp Checkin</span>
                        <span className="badge bg-danger">0 : Đến hạn Checkout</span>
                        <span className="badge bg-secondary">0 : Không xác định</span>
                    </div>
                </div>
            </div>
            {/* ...existing code... */}
            {/* Tỷ giá ngoại tệ */}
            <div className="card mb-4">
                <div className="card-header bg-success text-white">
                    Tỷ giá các ngoại tệ của Ngân hàng thương mại cổ phần Ngoại thương Việt Nam (Vietcombank) cập nhật 11/23/2017 2:13:18 PM
                </div>
                <div className="card-body p-0">
                    <table className="table table-bordered mb-0">
                        <thead className="table-success">
                            <tr>
                                <th>Mã ngoại tệ</th>
                                <th>Tên ngoại tệ</th>
                                <th>Mua tiền mặt</th>
                                <th>Chuyển khoản</th>
                                <th>Bán</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>USD</td>
                                <td>US DOLLAR</td>
                                <td>22,690</td>
                                <td>22,690</td>
                                <td>22,760</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            {/* ...existing code... */}
            {/* Tài sản sắp tới ngày bảo dưỡng */}
            <div className="card mb-4">
                <div className="card-header bg-info text-white">Tài sản sắp tới ngày bảo dưỡng</div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0">
                            <thead>
                                <tr>
                                    <th>Tên tài sản</th>
                                    <th>Vị trí</th>
                                    <th>Thời gian bảo dưỡng tiếp theo</th>
                                    <th>Lần bảo dưỡng gần nhất</th>
                                    <th>Nội dung</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td>TOK3-001</td>
                                    <td>30-11-2017</td>
                                    <td>03-11-2017</td>
                                    <td>sadsad</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* ...existing code... */}
            {/* Hợp đồng sắp tới hạn đóng tiền */}
            <div className="card mb-4">
                <div className="card-header bg-primary text-white">Hợp đồng sắp tới hạn đóng tiền</div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0">
                            <thead>
                                <tr>
                                    <th>Mã hợp đồng</th>
                                    <th>Tên khách hàng</th>
                                    <th>Mã phòng</th>
                                    <th>Ngày thanh toán tiền</th>
                                    <th>Yêu cầu đóng tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>a</td>
                                    <td>a</td>
                                    <td>a</td>
                                    <td>a</td>
                                    <td>a</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}