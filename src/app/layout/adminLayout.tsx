import { Box, Grid } from "@mui/material";
import Sidebar from "./sidebar";
import Dashboard from "../dashboard/page";
import React from "react";

interface AdminLayoutProps {
    children: React.ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 0, lg: 2 }} display={{ xs: 'none', lg: 'block' }}>
                <Sidebar></Sidebar>
            </Grid>
            <Grid size={{ xs: 12, lg: 10 }} sx={{ backgroundColor: '#F2F2F2', height: '100vh', padding: 3 }}>
                {children}
            </Grid>
        </Grid>
    )
}

export default AdminLayout;