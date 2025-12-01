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
import { FaFileContract, FaTimesCircle, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaSearch, FaCopy } from "react-icons/fa";

export default function SuperPolicyPage() {
    const [cancellationPolicies, setCancellationPolicies] = useState<CancellationPolicy[]>([]);
    const [cancellationRules, setCancellationRules] = useState<CancellationRule[]>([]);
    const [reschedulePolicies, setReschedulePolicies] = useState<ReschedulePolicy[]>([]);
    const [rescheduleRules, setRescheduleRules] = useState<RescheduleRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'cancellation-policies' | 'cancellation-rules' | 'reschedule-policies' | 'reschedule-rules'>('cancellation-policies');
    
    // Search states
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Could add toast notification here
        });
    };

    // Filter functions
    const filteredCancellationPolicies = cancellationPolicies.filter(policy =>
        (policy.name && policy.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (policy.description && policy.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredCancellationRules = cancellationRules.filter(rule =>
        (rule.name && rule.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rule.daysBeforeCheckIn !== undefined && rule.daysBeforeCheckIn !== null && rule.daysBeforeCheckIn.toString().includes(searchTerm)) ||
        (rule.penaltyPercentage !== undefined && rule.penaltyPercentage !== null && rule.penaltyPercentage.toString().includes(searchTerm)) ||
        (rule.id && rule.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredReschedulePolicies = reschedulePolicies.filter(policy =>
        (policy.name && policy.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (policy.description && policy.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredRescheduleRules = rescheduleRules.filter(rule =>
        (rule.name && rule.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rule.daysBeforeCheckIn !== undefined && rule.daysBeforeCheckIn !== null && rule.daysBeforeCheckIn.toString().includes(searchTerm)) ||
        (rule.feePercentage !== undefined && rule.feePercentage !== null && rule.feePercentage.toString().includes(searchTerm)) ||
        (rule.id && rule.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const renderCancellationPolicyRules = (rules?: Array<{ id: string; daysBeforeCheckIn: number; penaltyPercentage: number }>) => {
        if (!rules || rules.length === 0) {
            return <span className="text-muted small">Không có quy tắc</span>;
        }

        // Sort by daysBeforeCheckIn descending
        const sortedRules = [...rules].sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn);

        return (
            <div className="d-flex flex-column gap-2">
                {sortedRules.map((rule, index) => (
                    <div key={rule.id} className="d-flex align-items-center gap-2 p-2 bg-light rounded" style={{ minWidth: 'fit-content' }}>
                        <span className="badge bg-primary" style={{ minWidth: '80px', textAlign: 'center' }}>{rule.daysBeforeCheckIn}+ ngày</span>
                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>→</span>
                        <span className={`fw-semibold ${rule.penaltyPercentage === 0 ? 'text-success' : rule.penaltyPercentage === 100 ? 'text-danger' : 'text-warning'}`} style={{ minWidth: '100px' }}>
                            {rule.penaltyPercentage}% phí hủy
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const renderReschedulePolicyRules = (rules?: Array<{ id: string; daysBeforeCheckIn: number; feePercentage: number }>) => {
        if (!rules || rules.length === 0) {
            return <span className="text-muted small">Không có quy tắc</span>;
        }

        // Sort by daysBeforeCheckIn descending
        const sortedRules = [...rules].sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn);

        return (
            <div className="d-flex flex-column gap-2">
                {sortedRules.map((rule, index) => (
                    <div key={rule.id} className="d-flex align-items-center gap-2 p-2 bg-light rounded" style={{ minWidth: 'fit-content' }}>
                        <span className="badge bg-info" style={{ minWidth: '80px', textAlign: 'center' }}>{rule.daysBeforeCheckIn}+ ngày</span>
                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>→</span>
                        <span className={`fw-semibold ${rule.feePercentage === 0 ? 'text-success' : rule.feePercentage === 100 ? 'text-danger' : 'text-warning'}`} style={{ minWidth: '100px' }}>
                            {rule.feePercentage}% phí đổi lịch
                        </span>
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
                        Quản lý Chính sách & Quy định
                    </h1>
                    <p className="text-muted small mb-0 mt-2">
                        Quản lý các chính sách hủy phòng, đổi lịch và quy tắc liên quan
                    </p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                        <div className="fw-semibold text-primary" style={{ fontSize: '1.1rem' }}>
                            Tổng: {cancellationPolicies.length + cancellationRules.length + reschedulePolicies.length + rescheduleRules.length}
                        </div>
                        <div className="text-muted small">chính sách & quy tắc</div>
                    </div>
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
                                    placeholder="Tìm kiếm theo tên, mô tả, số ngày, phần trăm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            <span className="text-muted small">
                                {activeTab === 'cancellation-policies' && `Hiển thị ${filteredCancellationPolicies.length}/${cancellationPolicies.length} chính sách`}
                                {activeTab === 'cancellation-rules' && `Hiển thị ${filteredCancellationRules.length}/${cancellationRules.length} quy tắc`}
                                {activeTab === 'reschedule-policies' && `Hiển thị ${filteredReschedulePolicies.length}/${reschedulePolicies.length} chính sách`}
                                {activeTab === 'reschedule-rules' && `Hiển thị ${filteredRescheduleRules.length}/${rescheduleRules.length} quy tắc`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải dữ liệu chính sách...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger border-0 shadow-sm" role="alert">
                    <strong>Lỗi:</strong> {error}
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <ul className="nav nav-tabs mb-4" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'cancellation-policies' ? 'active' : ''}`}
                                onClick={() => setActiveTab('cancellation-policies')}
                            >
                                Chính sách hủy phòng ({cancellationPolicies.length})
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'cancellation-rules' ? 'active' : ''}`}
                                onClick={() => setActiveTab('cancellation-rules')}
                            >
                                Quy tắc hủy phòng ({cancellationRules.length})
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'reschedule-policies' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reschedule-policies')}
                            >
                                Chính sách đổi lịch ({reschedulePolicies.length})
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'reschedule-rules' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reschedule-rules')}
                            >
                                Quy tắc đổi lịch ({rescheduleRules.length})
                            </button>
                        </li>
                    </ul>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {/* Cancellation Policies Tab */}
                        {activeTab === 'cancellation-policies' && (
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    {filteredCancellationPolicies.length === 0 ? (
                                        <div className="text-center py-5">
                                            <FaTimesCircle className="mb-3" style={{ fontSize: '3rem', opacity: 0.3, color: '#6c757d' }} />
                                            <p className="mb-0 fs-5 text-muted">Không có chính sách hủy phòng</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead>
                                                    <tr style={{
                                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                        borderBottom: '2px solid #dee2e6'
                                                    }}>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '1cm', padding: '12px 8px', textAlign: 'left' }}>STT</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '4cm', padding: '12px 8px', textAlign: 'left' }}>Tên chính sách</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '5cm', padding: '12px 8px', textAlign: 'left' }}>Mô tả</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ minWidth: '8cm', padding: '12px 8px', textAlign: 'left' }}>Quy tắc</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredCancellationPolicies.map((policy, index) => (
                                                        <tr key={policy.id} className="border-bottom">
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <span className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                                    {index + 1}
                                                                </span>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '4cm', textAlign: 'left' }}>
                                                                <div>
                                                                    <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                                                                        {policy.name}
                                                                    </div>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <code className="text-muted small" style={{ fontSize: '0.7rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                                            {policy.id}
                                                                        </code>
                                                                        <button
                                                                            className="btn btn-sm p-0 border-0 text-muted"
                                                                            style={{ fontSize: '0.7rem' }}
                                                                            onClick={() => copyToClipboard(policy.id)}
                                                                            title="Copy ID"
                                                                        >
                                                                            <FaCopy />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '4cm', textAlign: 'left' }}>
                                                                <div className="text-dark" style={{ fontSize: '0.9rem', wordBreak: 'break-word', maxWidth: '4cm' }}>
                                                                    {policy.description || <span className="text-muted">Không có mô tả</span>}
                                                                </div>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '4cm', textAlign: 'left' }}>
                                                                <div style={{ maxWidth: '4cm' }}>
                                                                    {renderCancellationPolicyRules(policy.rules)}
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
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    {filteredCancellationRules.length === 0 ? (
                                        <div className="text-center py-5">
                                            <FaTimesCircle className="mb-3" style={{ fontSize: '3rem', opacity: 0.3, color: '#6c757d' }} />
                                            <p className="mb-0 fs-5 text-muted">Không có quy tắc hủy phòng</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead>
                                                    <tr style={{
                                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                        borderBottom: '2px solid #dee2e6'
                                                    }}>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '1cm', minWidth: '1cm', padding: '12px 8px', textAlign: 'left' }}>STT</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>Tên</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>ID</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>Số ngày trước check-in</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>Phần trăm phí hủy</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>Mô tả</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[...filteredCancellationRules].sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn).map((rule, index) => (
                                                        <tr key={rule.id} className="border-bottom">
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '1cm', textAlign: 'left' }}>
                                                                <span className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                                    {index + 1}
                                                                </span>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>
                                                                    {rule.name || `Quy tắc ${rule.daysBeforeCheckIn} ngày - ${rule.penaltyPercentage}%`}
                                                                </div>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <code className="text-primary small" style={{ fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                                        {rule.id}
                                                                    </code>
                                                                    <button
                                                                        className="btn btn-sm p-0 border-0 text-muted"
                                                                        style={{ fontSize: '0.75rem' }}
                                                                        onClick={() => copyToClipboard(rule.id)}
                                                                        title="Copy ID"
                                                                    >
                                                                        <FaCopy />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <span className="badge bg-primary" style={{ fontSize: '0.9rem' }}>
                                                                    {rule.daysBeforeCheckIn}+ ngày
                                                                </span>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <span className={`fw-semibold ${rule.penaltyPercentage === 0 ? 'text-success' : rule.penaltyPercentage === 100 ? 'text-danger' : 'text-warning'}`} style={{ fontSize: '0.9rem' }}>
                                                                    {rule.penaltyPercentage}%
                                                                </span>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <div className="text-dark" style={{ fontSize: '0.9rem' }}>
                                                                    {rule.penaltyPercentage === 0 ? (
                                                                        <span className="text-success"><FaCheckCircle /> Miễn phí hủy</span>
                                                                    ) : rule.penaltyPercentage === 100 ? (
                                                                        <span className="text-danger"><FaTimesCircle /> Không hoàn tiền</span>
                                                                    ) : (
                                                                        <span className="text-warning"><FaExclamationTriangle /> Phí hủy {rule.penaltyPercentage}%</span>
                                                                    )}
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

                        {/* Reschedule Policies Tab */}
                        {activeTab === 'reschedule-policies' && (
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    {filteredReschedulePolicies.length === 0 ? (
                                        <div className="text-center py-5">
                                            <FaCalendarAlt className="mb-3" style={{ fontSize: '3rem', opacity: 0.3, color: '#6c757d' }} />
                                            <p className="mb-0 fs-5 text-muted">Không có chính sách đổi lịch</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead>
                                                    <tr style={{
                                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                        borderBottom: '2px solid #dee2e6'
                                                    }}>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>STT</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '4cm', minWidth: '4cm', padding: '12px 8px', textAlign: 'left' }}>Tên chính sách</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '4cm', minWidth: '4cm', padding: '12px 8px', textAlign: 'left' }}>Mô tả</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '4cm', minWidth: '4cm', padding: '12px 8px', textAlign: 'left' }}>Quy tắc</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredReschedulePolicies.map((policy, index) => (
                                                        <tr key={policy.id} className="border-bottom">
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <span className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                                    {index + 1}
                                                                </span>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '4cm', textAlign: 'left' }}>
                                                                <div>
                                                                    <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                                                                        {policy.name}
                                                                    </div>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <code className="text-muted small" style={{ fontSize: '0.7rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                                            {policy.id}
                                                                        </code>
                                                                        <button
                                                                            className="btn btn-sm p-0 border-0 text-muted"
                                                                            style={{ fontSize: '0.7rem' }}
                                                                            onClick={() => copyToClipboard(policy.id)}
                                                                            title="Copy ID"
                                                                        >
                                                                            <FaCopy />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '4cm', textAlign: 'left' }}>
                                                                <div className="text-dark" style={{ fontSize: '0.9rem', wordBreak: 'break-word', maxWidth: '4cm' }}>
                                                                    {policy.description || <span className="text-muted">Không có mô tả</span>}
                                                                </div>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '4cm', textAlign: 'left' }}>
                                                                <div style={{ maxWidth: '4cm' }}>
                                                                    {renderReschedulePolicyRules(policy.rules)}
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
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    {filteredRescheduleRules.length === 0 ? (
                                        <div className="text-center py-5">
                                            <FaCalendarAlt className="mb-3" style={{ fontSize: '3rem', opacity: 0.3, color: '#6c757d' }} />
                                            <p className="mb-0 fs-5 text-muted">Không có quy tắc đổi lịch</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead>
                                                    <tr style={{
                                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                        borderBottom: '2px solid #dee2e6'
                                                    }}>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '1cm', minWidth: '1cm', padding: '12px 8px', textAlign: 'left' }}>STT</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>Tên</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>ID</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>Số ngày trước check-in</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>Phần trăm phí đổi lịch</th>
                                                        <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', padding: '12px 8px', textAlign: 'left' }}>Mô tả</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[...filteredRescheduleRules].sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn).map((rule, index) => (
                                                        <tr key={rule.id} className="border-bottom">
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '1cm', textAlign: 'left' }}>
                                                                <span className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                                    {index + 1}
                                                                </span>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>
                                                                    {rule.name || `Quy tắc ${rule.daysBeforeCheckIn} ngày - ${rule.feePercentage}%`}
                                                                </div>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <code className="text-primary small" style={{ fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                                        {rule.id}
                                                                    </code>
                                                                    <button
                                                                        className="btn btn-sm p-0 border-0 text-muted"
                                                                        style={{ fontSize: '0.75rem' }}
                                                                        onClick={() => copyToClipboard(rule.id)}
                                                                        title="Copy ID"
                                                                    >
                                                                        <FaCopy />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <span className="badge bg-info" style={{ fontSize: '0.9rem' }}>
                                                                    {rule.daysBeforeCheckIn}+ ngày
                                                                </span>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <span className={`fw-semibold ${rule.feePercentage === 0 ? 'text-success' : rule.feePercentage === 100 ? 'text-danger' : 'text-warning'}`} style={{ fontSize: '0.9rem' }}>
                                                                    {rule.feePercentage}%
                                                                </span>
                                                            </td>
                                                            <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                                <div className="text-dark" style={{ fontSize: '0.9rem' }}>
                                                                    {rule.feePercentage === 0 ? (
                                                                        <span className="text-success"><FaCheckCircle /> Miễn phí đổi lịch</span>
                                                                    ) : rule.feePercentage === 100 ? (
                                                                        <span className="text-danger"><FaTimesCircle /> Không cho phép đổi lịch</span>
                                                                    ) : (
                                                                        <span className="text-warning"><FaExclamationTriangle /> Phí đổi lịch {rule.feePercentage}%</span>
                                                                    )}
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
                    </div>
                </>
            )}
        </div>
    );
}

