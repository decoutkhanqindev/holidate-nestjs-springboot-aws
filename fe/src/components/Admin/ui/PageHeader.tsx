// src/components/admin/ui/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
    title: React.ReactNode;
    children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            {children && <div>{children}</div>}
        </div>
    );
}