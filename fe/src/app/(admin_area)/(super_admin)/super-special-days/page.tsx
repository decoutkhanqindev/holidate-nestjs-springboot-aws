"use client";

import { useState, useEffect } from "react";
import { getAllSpecialDays, type SpecialDay } from "@/lib/AdminAPI/specialDayService";
import { createSpecialDayAction, updateSpecialDayAction, deleteSpecialDayAction } from "@/lib/actions/specialDayActions";
import { toast } from "react-toastify";
import { FaCalendarDay, FaPlus, FaEdit, FaTrash, FaSearch, FaCopy, FaTimes } from "react-icons/fa";

export default function SuperSpecialDaysPage() {
    const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpecialDay, setEditingSpecialDay] = useState<SpecialDay | null>(null);
    const [formData, setFormData] = useState({ date: '', name: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadSpecialDays();
    }, []);

    const loadSpecialDays = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllSpecialDays();
            // Sort by date descending (newest first)
            const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setSpecialDays(sorted);
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách ngày đặc biệt');
            toast.error('Không thể tải danh sách ngày đặc biệt');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSpecialDays = specialDays.filter(day =>
        (day.name && day.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (day.date && day.date.includes(searchTerm)) ||
        (day.id && day.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenModal = (specialDay?: SpecialDay) => {
        if (specialDay) {
            setEditingSpecialDay(specialDay);
            setFormData({ date: specialDay.date, name: specialDay.name });
        } else {
            setEditingSpecialDay(null);
            setFormData({ date: '', name: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSpecialDay(null);
        setFormData({ date: '', name: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate date format (YYYY-MM-DD)
            if (!formData.date || !formData.name.trim()) {
                toast.error('Vui lòng điền đầy đủ thông tin');
                setIsSubmitting(false);
                return;
            }

            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(formData.date)) {
                toast.error('Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD');
                setIsSubmitting(false);
                return;
            }

            // Validate date is valid
            const dateObj = new Date(formData.date);
            if (isNaN(dateObj.getTime())) {
                toast.error('Ngày không hợp lệ');
                setIsSubmitting(false);
                return;
            }

            console.log("[SuperSpecialDaysPage] Submitting form:", {
                editing: !!editingSpecialDay,
                formData: formData,
            });

            let result;
            if (editingSpecialDay) {
                // Update
                result = await updateSpecialDayAction(editingSpecialDay.id, formData);
            } else {
                // Create
                result = await createSpecialDayAction(formData);
            }

            console.log("[SuperSpecialDaysPage] Action result:", result);

            if (result.success) {
                toast.success(editingSpecialDay ? 'Cập nhật ngày đặc biệt thành công' : 'Tạo ngày đặc biệt thành công');
                handleCloseModal();
                loadSpecialDays();
            } else {
                const errorMsg = result.error || 'Có lỗi xảy ra';
                console.error("[SuperSpecialDaysPage] Error from action:", errorMsg);
                
                // Kiểm tra xem có phải là lỗi authentication không
                if (errorMsg.includes('đăng nhập') || errorMsg.includes('hết hạn')) {
                    toast.error(errorMsg, {
                        autoClose: 5000,
                    });
                    // Có thể redirect đến login page sau 2 giây
                    setTimeout(() => {
                        window.location.href = '/admin-login';
                    }, 2000);
                } else {
                    toast.error(errorMsg, {
                        autoClose: 5000,
                    });
                }
            }
        } catch (err: any) {
            console.error("[SuperSpecialDaysPage] Exception caught:", err);
            const errorMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra';
            toast.error(errorMsg, {
                autoClose: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa ngày đặc biệt "${name}"?`)) {
            return;
        }

        try {
            const result = await deleteSpecialDayAction(id);
            if (result.success) {
                toast.success('Xóa ngày đặc biệt thành công');
                loadSpecialDays();
            } else {
                toast.error(result.error || 'Không thể xóa ngày đặc biệt. Có thể ngày này đang được sử dụng trong mã giảm giá.');
            }
        } catch (err: any) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Đã sao chép ID');
        });
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="container-fluid px-4 py-3">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h1 className="h4 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
                        <FaCalendarDay className="text-primary" />
                        Quản lý Ngày đặc biệt
                    </h1>
                    <p className="text-muted small mb-0 mt-2">
                        Quản lý các ngày đặc biệt cho các chiến dịch khuyến mãi và mã giảm giá
                    </p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                        <div className="fw-semibold text-primary" style={{ fontSize: '1.1rem' }}>
                            Tổng: {specialDays.length}
                        </div>
                        <div className="text-muted small">ngày đặc biệt</div>
                    </div>
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => handleOpenModal()}
                    >
                        <FaPlus /> Thêm ngày đặc biệt
                    </button>
                </div>
            </div>

            {/* Search Section */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <FaSearch className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Tìm kiếm theo tên, ngày, ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            <span className="text-muted small">
                                Hiển thị {filteredSpecialDays.length}/{specialDays.length} ngày đặc biệt
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải danh sách ngày đặc biệt...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger border-0 shadow-sm" role="alert">
                    <strong>Lỗi:</strong> {error}
                </div>
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        {filteredSpecialDays.length === 0 ? (
                            <div className="text-center py-5">
                                <FaCalendarDay className="mb-3" style={{ fontSize: '3rem', opacity: 0.3, color: '#6c757d' }} />
                                <p className="mb-0 fs-5 text-muted">
                                    {searchTerm ? 'Không tìm thấy ngày đặc biệt nào' : 'Chưa có ngày đặc biệt nào'}
                                </p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '1.5cm', minWidth: '1.5cm', padding: '12px 8px', textAlign: 'left' }}>STT</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '3.5cm', minWidth: '3.5cm', padding: '12px 8px', textAlign: 'left' }}>Tên</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '3.5cm', minWidth: '3.5cm', padding: '12px 8px', textAlign: 'left' }}>Ngày</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '3.5cm', minWidth: '3.5cm', padding: '12px 8px', textAlign: 'left' }}>ID</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '3.5cm', minWidth: '3.5cm', padding: '12px 8px', textAlign: 'left' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSpecialDays.map((day, index) => (
                                            <tr key={day.id} className="border-bottom">
                                                <td className="align-middle" style={{ padding: '12px 8px', width: '1.5cm', textAlign: 'left' }}>
                                                    <span className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="align-middle" style={{ padding: '12px 8px', width: '3.5cm', textAlign: 'left' }}>
                                                    <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem', wordBreak: 'break-word', maxWidth: '3.5cm' }}>
                                                        {day.name}
                                                    </div>
                                                </td>
                                                <td className="align-middle" style={{ padding: '12px 8px', width: '3.5cm', textAlign: 'left' }}>
                                                    <span className="badge bg-info text-dark" style={{ fontSize: '0.9rem' }}>
                                                        {formatDate(day.date)}
                                                    </span>
                                                </td>
                                                <td className="align-middle" style={{ padding: '12px 8px', width: '3.5cm', textAlign: 'left' }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <code className="text-primary small" style={{ fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: '3.5cm' }}>
                                                            {day.id}
                                                        </code>
                                                        <button
                                                            className="btn btn-sm p-0 border-0 text-muted"
                                                            style={{ fontSize: '0.75rem' }}
                                                            onClick={() => copyToClipboard(day.id)}
                                                            title="Copy ID"
                                                        >
                                                            <FaCopy />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="align-middle" style={{ padding: '12px 8px', width: '3.5cm', textAlign: 'left' }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary p-2"
                                                            onClick={() => handleOpenModal(day)}
                                                            title="Chỉnh sửa"
                                                            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <FaEdit style={{ fontSize: '14px' }} />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger p-2"
                                                            onClick={() => handleDelete(day.id, day.name)}
                                                            title="Xóa"
                                                            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <FaTrash style={{ fontSize: '14px' }} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">
                                    {editingSpecialDay ? 'Chỉnh sửa Ngày đặc biệt' : 'Thêm Ngày đặc biệt mới'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                    disabled={isSubmitting}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="date" className="form-label fw-semibold">
                                            Ngày <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            disabled={isSubmitting}
                                        />
                                        <small className="text-muted">Định dạng: YYYY-MM-DD. Mỗi ngày chỉ có thể có một ngày đặc biệt.</small>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label fw-semibold">
                                            Tên ngày đặc biệt <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ví dụ: Ngày Quốc khánh, Tết Nguyên Đán, Black Friday..."
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCloseModal}
                                        disabled={isSubmitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting || !formData.date || !formData.name.trim()}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            editingSpecialDay ? 'Cập nhật' : 'Tạo mới'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

