"use client";

import { useState, useEffect } from "react";
import {
    getAllCancellationPolicies,
    getAllCancellationRules,
    getAllReschedulePolicies,
    getAllRescheduleRules,
    type CancellationPolicy,
    type CancellationRule,
    type ReschedulePolicy,
    type RescheduleRule
} from "@/lib/AdminAPI/policyService";
import { FaFileContract, FaTimesCircle, FaCalendarAlt, FaSearch } from "react-icons/fa";
import LoadingSpinner from "@/components/Admin/common/LoadingSpinner";

export default function AdminPoliciesPage() {
    const [cancellationPolicies, setCancellationPolicies] = useState<CancellationPolicy[]>([]);
    const [cancellationRules, setCancellationRules] = useState<CancellationRule[]>([]);
    const [reschedulePolicies, setReschedulePolicies] = useState<ReschedulePolicy[]>([]);
    const [rescheduleRules, setRescheduleRules] = useState<RescheduleRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'cancellation-policies' | 'cancellation-rules' | 'reschedule-policies' | 'reschedule-rules'>('cancellation-policies');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [cancellationPoliciesData, cancellationRulesData, reschedulePoliciesData, rescheduleRulesData] = await Promise.all([
                    getAllCancellationPolicies(),
                    getAllCancellationRules(),
                    getAllReschedulePolicies(),
                    getAllRescheduleRules()
                ]);

                setCancellationPolicies(cancellationPoliciesData);
                setCancellationRules(cancellationRulesData);
                setReschedulePolicies(reschedulePoliciesData);
                setRescheduleRules(rescheduleRulesData);
            } catch (err: any) {
                setError(err.message || 'Không thể tải dữ liệu chính sách');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Filter functions
    const filteredCancellationPolicies = cancellationPolicies.filter(policy =>
        (policy.name && policy.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (policy.description && policy.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (policy.id && policy.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredCancellationRules = cancellationRules.filter(rule =>
        (rule.name && rule.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rule.daysBeforeCheckIn !== undefined && rule.daysBeforeCheckIn.toString().includes(searchTerm)) ||
        (rule.penaltyPercentage !== undefined && rule.penaltyPercentage.toString().includes(searchTerm)) ||
        (rule.id && rule.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredReschedulePolicies = reschedulePolicies.filter(policy =>
        (policy.name && policy.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (policy.description && policy.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (policy.id && policy.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredRescheduleRules = rescheduleRules.filter(rule =>
        (rule.name && rule.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rule.daysBeforeCheckIn !== undefined && rule.daysBeforeCheckIn.toString().includes(searchTerm)) ||
        (rule.feePercentage !== undefined && rule.feePercentage.toString().includes(searchTerm)) ||
        (rule.id && rule.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const renderCancellationPolicyRules = (rules?: Array<{ id: string; daysBeforeCheckIn: number; penaltyPercentage: number }>, policyName?: string) => {
        if (!rules || rules.length === 0) {
            return <span className="text-muted small">Không có quy tắc</span>;
        }

        // Sort by daysBeforeCheckIn descending
        const sortedRules = [...rules].sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn);

        return (
            <div className="d-flex flex-column gap-2">
                {sortedRules.map((rule) => (
                    <div key={rule.id} className="d-flex flex-column gap-1 p-2 bg-light rounded">
                        {policyName && (
                            <div className="fw-semibold text-primary small">{policyName}</div>
                        )}
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary" style={{ minWidth: '80px', textAlign: 'center' }}>{rule.daysBeforeCheckIn}+ ngày</span>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>→</span>
                            <span className={`fw-semibold ${rule.penaltyPercentage === 0 ? 'text-success' : rule.penaltyPercentage === 100 ? 'text-danger' : 'text-warning'}`} style={{ minWidth: '100px' }}>
                                {rule.penaltyPercentage}% phí hủy
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderReschedulePolicyRules = (rules?: Array<{ id: string; daysBeforeCheckIn: number; feePercentage: number }>, policyName?: string) => {
        if (!rules || rules.length === 0) {
            return <span className="text-muted small">Không có quy tắc</span>;
        }

        // Sort by daysBeforeCheckIn descending
        const sortedRules = [...rules].sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn);

        return (
            <div className="d-flex flex-column gap-2">
                {sortedRules.map((rule) => (
                    <div key={rule.id} className="d-flex flex-column gap-1 p-2 bg-light rounded">
                        {policyName && (
                            <div className="fw-semibold text-info small">{policyName}</div>
                        )}
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-info" style={{ minWidth: '80px', textAlign: 'center' }}>{rule.daysBeforeCheckIn}+ ngày</span>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>→</span>
                            <span className={`fw-semibold ${rule.feePercentage === 0 ? 'text-success' : rule.feePercentage === 100 ? 'text-danger' : 'text-warning'}`} style={{ minWidth: '100px' }}>
                                {rule.feePercentage}% phí đổi lịch
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container-fluid px-4 py-3" style={{ paddingLeft: 'calc(2cm + 1rem)' }}>
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h1 className="h4 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
                        <FaFileContract className="text-primary" />
                        Chính sách & Quy định
                    </h1>
                    <p className="text-muted small mb-0 mt-2">
                        Xem các chính sách hủy phòng, đổi lịch và quy tắc liên quan
                    </p>
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner message="Đang tải danh sách chính sách..." />
            ) : error ? (
                <div className="alert alert-danger border-0 shadow-sm" role="alert">
                    <strong>Lỗi:</strong> {error}
                </div>
            ) : (
                <>
                    {/* Search Section */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-6">
                                    <label className="form-label small fw-semibold text-muted d-flex align-items-center gap-2">
                                        <FaSearch />
                                        Tìm kiếm
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Tìm theo tên, mô tả, ID, số ngày, phần trăm..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {searchTerm && (
                                    <div className="col-md-2">
                                        <button
                                            className="btn btn-outline-secondary btn-sm w-100"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <ul className="nav nav-tabs mb-4" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'cancellation-policies' ? 'active' : ''}`}
                                onClick={() => setActiveTab('cancellation-policies')}
                            >
                                <FaTimesCircle className="me-2" />
                                Chính sách hủy ({cancellationPolicies.length})
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'cancellation-rules' ? 'active' : ''}`}
                                onClick={() => setActiveTab('cancellation-rules')}
                            >
                                <FaTimesCircle className="me-2" />
                                Quy tắc hủy ({cancellationRules.length})
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'reschedule-policies' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reschedule-policies')}
                            >
                                <FaCalendarAlt className="me-2" />
                                Chính sách đổi lịch ({reschedulePolicies.length})
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'reschedule-rules' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reschedule-rules')}
                            >
                                <FaCalendarAlt className="me-2" />
                                Quy tắc đổi lịch ({rescheduleRules.length})
                            </button>
                        </li>
                    </ul>

                    {/* Content */}
                    <div className="tab-content">
                        {/* Cancellation Policies Tab */}
                        {activeTab === 'cancellation-policies' && (
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    {filteredCancellationPolicies.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <p>{searchTerm ? 'Không tìm thấy kết quả' : 'Không có chính sách hủy nào'}</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th scope="col" className="p-3">Tên chính sách</th>
                                                        <th scope="col" className="p-3">Mô tả</th>
                                                        <th scope="col" className="p-3">Quy tắc</th>
                                                        <th scope="col" className="p-3">ID (UUID)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredCancellationPolicies.map((policy) => (
                                                        <tr key={policy.id}>
                                                            <td className="p-3">
                                                                <div className="fw-semibold text-dark">{policy.name}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-dark" style={{ maxWidth: '400px' }}>
                                                                    {policy.description || <span className="text-muted">Không có mô tả</span>}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                {renderCancellationPolicyRules(policy.rules, policy.name)}
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="small text-muted font-monospace" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                                                    {policy.id}
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

                        {/* Cancellation Rules Tab */}
                        {activeTab === 'cancellation-rules' && (
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    {filteredCancellationRules.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <p>{searchTerm ? 'Không tìm thấy kết quả' : 'Không có quy tắc hủy nào'}</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th scope="col" className="p-3">Số ngày trước check-in</th>
                                                        <th scope="col" className="p-3">Phần trăm phí hủy</th>
                                                        <th scope="col" className="p-3">Mô tả</th>
                                                        <th scope="col" className="p-3">ID (UUID)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredCancellationRules
                                                        .sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn)
                                                        .map((rule) => {
                                                            // Tìm policy chứa rule này
                                                            const policy = cancellationPolicies.find(p => 
                                                                p.rules?.some(r => r.id === rule.id)
                                                            );
                                                            
                                                            return (
                                                                <tr key={rule.id}>
                                                                    <td className="p-3">
                                                                        <div className="d-flex flex-column gap-1">
                                                                            {policy && (
                                                                                <div className="fw-semibold text-primary small mb-1">{policy.name}</div>
                                                                            )}
                                                                            <span className="badge bg-primary" style={{ fontSize: '0.9rem', width: 'fit-content' }}>
                                                                                {rule.daysBeforeCheckIn}+ ngày
                                                                            </span>
                                                                            <small className="text-muted">Trước ngày check-in</small>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="d-flex flex-column gap-1">
                                                                            <span className={`fw-bold ${rule.penaltyPercentage === 0 ? 'text-success' : rule.penaltyPercentage === 100 ? 'text-danger' : 'text-warning'}`} style={{ fontSize: '1.1rem' }}>
                                                                                {rule.penaltyPercentage}%
                                                                            </span>
                                                                            <small className="text-muted">Phí hủy</small>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="text-dark">
                                                                            {rule.penaltyPercentage === 0 ? (
                                                                                <span className="badge bg-success">Miễn phí hủy</span>
                                                                            ) : rule.penaltyPercentage === 100 ? (
                                                                                <span className="badge bg-danger">Không hoàn tiền</span>
                                                                            ) : (
                                                                                <span className="badge bg-warning">Hủy có phí</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="small text-muted font-monospace" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                                                            {rule.id}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reschedule Policies Tab */}
                        {activeTab === 'reschedule-policies' && (
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    {filteredReschedulePolicies.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <p>{searchTerm ? 'Không tìm thấy kết quả' : 'Không có chính sách đổi lịch nào'}</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th scope="col" className="p-3">Tên chính sách</th>
                                                        <th scope="col" className="p-3">Mô tả</th>
                                                        <th scope="col" className="p-3">Quy tắc</th>
                                                        <th scope="col" className="p-3">ID (UUID)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredReschedulePolicies.map((policy) => (
                                                        <tr key={policy.id}>
                                                            <td className="p-3">
                                                                <div className="fw-semibold text-dark">{policy.name}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-dark" style={{ maxWidth: '400px' }}>
                                                                    {policy.description || <span className="text-muted">Không có mô tả</span>}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                {renderReschedulePolicyRules(policy.rules, policy.name)}
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="small text-muted font-monospace" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                                                    {policy.id}
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

                        {/* Reschedule Rules Tab */}
                        {activeTab === 'reschedule-rules' && (
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    {filteredRescheduleRules.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <p>{searchTerm ? 'Không tìm thấy kết quả' : 'Không có quy tắc đổi lịch nào'}</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th scope="col" className="p-3">Số ngày trước check-in</th>
                                                        <th scope="col" className="p-3">Phần trăm phí đổi lịch</th>
                                                        <th scope="col" className="p-3">Mô tả</th>
                                                        <th scope="col" className="p-3">ID (UUID)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredRescheduleRules
                                                        .sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn)
                                                        .map((rule) => {
                                                            // Tìm policy chứa rule này
                                                            const policy = reschedulePolicies.find(p => 
                                                                p.rules?.some(r => r.id === rule.id)
                                                            );
                                                            
                                                            return (
                                                                <tr key={rule.id}>
                                                                    <td className="p-3">
                                                                        <div className="d-flex flex-column gap-1">
                                                                            {policy && (
                                                                                <div className="fw-semibold text-info small mb-1">{policy.name}</div>
                                                                            )}
                                                                            <span className="badge bg-info" style={{ fontSize: '0.9rem', width: 'fit-content' }}>
                                                                                {rule.daysBeforeCheckIn}+ ngày
                                                                            </span>
                                                                            <small className="text-muted">Trước ngày check-in</small>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="d-flex flex-column gap-1">
                                                                            <span className={`fw-bold ${rule.feePercentage === 0 ? 'text-success' : rule.feePercentage === 100 ? 'text-danger' : 'text-warning'}`} style={{ fontSize: '1.1rem' }}>
                                                                                {rule.feePercentage}%
                                                                            </span>
                                                                            <small className="text-muted">Phí đổi lịch</small>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="text-dark">
                                                                            {rule.feePercentage === 0 ? (
                                                                                <span className="badge bg-success">Miễn phí đổi</span>
                                                                            ) : rule.feePercentage === 100 ? (
                                                                                <span className="badge bg-danger">Không được đổi</span>
                                                                            ) : (
                                                                                <span className="badge bg-warning">Đổi có phí</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="small text-muted font-monospace" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                                                            {rule.id}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

