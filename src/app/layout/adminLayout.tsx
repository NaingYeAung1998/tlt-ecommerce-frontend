"use client"

import { Box, Grid, IconButton, Modal } from "@mui/material";
import Sidebar from "./sidebar";
import Dashboard from "../dashboard/page";
import React, { useState } from "react";
import { Menu as MenuIcon } from "@mui/icons-material";

interface AdminLayoutProps {
    children: React.ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 0, lg: 2 }} display={{ xs: 'none', lg: 'block' }}>
                <Sidebar handleSidebarClose={() => setSidebarOpen(false)}></Sidebar>
            </Grid>
            <Grid size={{ xs: 12, lg: 10 }} sx={{ backgroundColor: '#F2F2F2', height: '100vh', padding: 3 }}>
                <IconButton onClick={() => setSidebarOpen(true)} sx={{ display: { xs: 'block', lg: 'none' } }}> <MenuIcon /></IconButton>
                <Modal open={sidebarOpen} onClose={() => setSidebarOpen(false)} sx={{ display: { xs: 'block', lg: 'none' } }}>
                    <Sidebar handleSidebarClose={() => setSidebarOpen(false)}></Sidebar>
                </Modal>
                {children}
            </Grid>
        </Grid>
    )
}

export default AdminLayout;