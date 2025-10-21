import React from 'react';

const roomStatus = [
    { color: 'primary', label: 'Cần dọn' },
    { color: 'info', label: 'Phòng trống (14)' },
    { color: 'success', label: 'Đang giữ (0)' },
    { color: 'purple', label: 'Ở theo giờ (1)' },
    { color: 'danger', label: 'Ở qua đêm (2)' },
];

const rooms = [
    { id: 102, status: 'primary', name: 'Phòng 102' },
    { id: 103, status: 'danger', name: 'Phòng 103', guest: 'Trương Vĩnh', phone: '0906789876' },
    { id: 104, status: 'purple', name: 'Phòng 104', guest: 'Khách 876' },
    { id: 105, status: 'primary', name: 'Phòng 105' },
    { id: 202, status: 'danger', name: 'Phòng 202', guest: 'Nguyễn Thị Lý', phone: '0989786345' },
    // ...thêm các phòng khác tương tự
];

const statusColor: Record<string, string> = {
    primary: '#2196f3',
    info: '#00bcd4',
    success: '#4caf50',
    purple: '#9c27b0',
    danger: '#f44336',
    default: '#e0e0e0',
};

export default function RoomManagerPage() {
    return (
        <div className="container-fluid py-4">
            <div className="row mb-3 align-items-center">
                <div className="col-auto">
                    <input type="date" className="form-control" defaultValue="2013-12-12" />
                </div>
                <div className="col-auto">Đến ngày:</div>
                <div className="col-auto">
                    <input type="date" className="form-control" defaultValue="2013-12-12" />
                </div>
                <div className="col-auto">
                    <button className="btn btn-info rounded-pill px-4 fw-bold shadow-sm">Xem chi tiết <i className="bi bi-chevron-double-right"></i></button>
                </div>
            </div>
            <div className="mb-3">
                <span className="me-3 fw-bold">Tình Trạng Phòng:</span>
                <span className="badge bg-primary me-2">Cần dọn</span>
                <span className="badge bg-info me-2">Phòng trống (14)</span>
                <span className="badge bg-success me-2">Đang giữ (0)</span>
                <span className="badge" style={{ background: '#9c27b0', color: '#fff' }}>Ở theo giờ (1)</span>
                <span className="badge bg-danger ms-2">Ở qua đêm (2)</span>
            </div>
            <div className="d-flex flex-wrap gap-4 mt-4">
                {rooms.map((room) => (
                    <div key={room.id} style={{ minWidth: 130 }}>
                        <div
                            className="shadow-lg d-flex flex-column align-items-center justify-content-center"
                            style={{
                                background: statusColor[room.status] || statusColor.default,
                                borderRadius: 16,
                                width: 120,
                                minHeight: 90,
                                color: '#fff',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                                position: 'relative',
                                marginBottom: 8,
                            }}
                        >
                            <i className="bi bi-bed" style={{ fontSize: 32, marginTop: 8 }}></i>
                            <div className="fw-bold mt-1" style={{ fontSize: 16 }}>{room.name}</div>
                            {room.guest && (
                                <div className="small mt-1 text-light text-center" style={{ fontSize: 13 }}>
                                    {room.guest}<br />
                                    <span style={{ color: '#e3f2fd', fontSize: 12 }}>{room.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
