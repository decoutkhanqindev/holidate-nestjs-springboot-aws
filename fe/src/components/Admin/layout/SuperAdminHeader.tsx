"use client";

import { useAuth } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";

export default function SuperAdminHeader() {
    const { effectiveUser, logout } = useAuth();

    const displayName = effectiveUser?.email ? effectiveUser.email.split('@')[0] : 'Super Admin';

    return (
        <header style={{
            padding: '16px 24px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}>
            <div>
                <h5 style={{ margin: 0, fontWeight: 600, color: "black" }}>Super Admin Dashboard</h5>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 500, color: '#2d3748' }}>
                    Chào, <strong style={{ color: '#3182ce' }}>{displayName}!</strong>
                </span>
                <button
                    onClick={logout}
                    className="btn btn-danger"
                    style={{
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        borderRadius: '8px'
                    }}
                >
                    Đăng xuất
                </button>
            </div>
        </header>
    );
}