// src/app/admin/layout.tsx
import React from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container-fluid bg-light min-vh-100">
            {children}
        </div>
    );
}
