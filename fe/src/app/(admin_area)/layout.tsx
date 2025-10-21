"use client";
import { AuthProvider } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
import { ReactNode } from "react";

export default function AdminAreaLayout({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}