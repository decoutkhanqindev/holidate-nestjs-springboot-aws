// components/Admin/SuperAdminDashboard/StatCard.tsx
import { IconType } from "react-icons";

interface StatCardProps {
    title: string;
    value: string;
    icon: IconType;
    variant: 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatCard({ title, value, icon: Icon, variant }: StatCardProps) {
    return (
        <div className={`card shadow-sm border-0 border-start border-5 border-${variant}`}>
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                        <p className="text-muted mb-1">{title}</p>
                        <h3 className="fw-bold mb-0">{value}</h3>
                    </div>
                    <div className={`fs-1 text-${variant}`}>
                        <Icon />
                    </div>
                </div>
            </div>
        </div>
    );
}