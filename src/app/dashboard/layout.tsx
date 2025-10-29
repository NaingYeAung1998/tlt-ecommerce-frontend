import React from "react";
import AdminLayout from "../layout/adminLayout";

interface DashboardLayoutProps {
    children: React.ReactNode
}

function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    )
}

export default DashboardLayout;