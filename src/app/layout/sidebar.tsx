"use client"

import { AccountBox as AccountBoxIcon, BusinessCenter as BusinessCenterIcon, Category as CategoryIcon, Dashboard as DashboardIcon, Drafts as DraftsIcon, Factory as FactoryIcon, Grade as GradeIcon, Inbox as InboxIcon, Inventory as InventoryIcon, People as PeopleIcon, Receipt as ReceiptIcon, Scale as ScaleIcon, Warehouse as WarehouseIcon } from "@mui/icons-material";
import { Box, Collapse, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Typography } from "@mui/material";
import SidebarButton from "../components/sidebarButton";
import { FC, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface SiderbarProps {
    handleSidebarClose: () => void
}

const Sidebar: FC<SiderbarProps> = ({ handleSidebarClose }) => {
    const pathname = usePathname();
    const [inventoryCollapse, setInventoryCollapse] = useState(true);
    const [currentRoute, setCurrentRoute] = useState(pathname);
    const router = useRouter();

    const handleRoute = (route: string) => {
        setCurrentRoute(route);
        router.push(route);
        handleSidebarClose();
    }
    return (
        <Box sx={{ width: '100%', maxWidth: 360, padding: 1, backgroundColor: 'white', height: '100%' }}>
            <nav aria-label="main mailbox folders">
                <List
                    subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
                            <div className="flex justify-center pb-10">
                                {/* <img src={"/logo.jpg"} width={'80px'} height={'100px'} /> */}
                                <Typography variant="h5" color="primary" textAlign={'center'} fontWeight={'bold'}>TLT Warehouse</Typography>
                            </div>
                            {/* <Divider /> */}
                        </ListSubheader>
                    }>
                    <ListItem>
                        <SidebarButton icon={<DashboardIcon />} label="Dashboard" selected={currentRoute.endsWith('dashboard')} handleClick={() => handleRoute('/dashboard')} />
                    </ListItem>
                    <ListItem >
                        <SidebarButton handleClick={() => setInventoryCollapse(!inventoryCollapse)} icon={<InventoryIcon />} label="Inventory" selected={false} isNested={true} isCollapse={inventoryCollapse} />

                    </ListItem>
                    <Collapse in={!inventoryCollapse} timeout="auto" unmountOnExit>
                        <List component="div" sx={{ pl: 4 }}>
                            <SidebarButton icon={<CategoryIcon />} label="Category" selected={currentRoute.includes('category')} handleClick={() => handleRoute('/dashboard/category')} />
                        </List>
                        <List component="div" sx={{ pl: 4 }}>
                            <SidebarButton icon={<GradeIcon />} label="Grade" selected={currentRoute.includes('grade')} handleClick={() => handleRoute('/dashboard/grade')} />
                        </List>
                        <List component="div" sx={{ pl: 4 }}>
                            <SidebarButton icon={<ScaleIcon />} label="Unit" selected={currentRoute.includes('unit')} handleClick={() => handleRoute('/dashboard/unit')} />
                        </List>
                        <List component="div" sx={{ pl: 4 }}>
                            <SidebarButton icon={<BusinessCenterIcon />} label="Product" selected={currentRoute.includes('product')} handleClick={() => handleRoute('/dashboard/product')} />
                        </List>
                    </Collapse>
                    <ListItem>
                        <SidebarButton icon={<ReceiptIcon />} label="Orders" selected={false} />
                    </ListItem>
                    <ListItem>
                        <SidebarButton icon={<AccountBoxIcon />} label="Customer" selected={currentRoute.includes('customer')} handleClick={() => handleRoute('/dashboard/customer')} />
                    </ListItem>
                    <ListItem>
                        <SidebarButton icon={<PeopleIcon />} label="Supplier" selected={currentRoute.includes('supplier')} handleClick={() => handleRoute('/dashboard/supplier')} />
                    </ListItem>
                    <ListItem>
                        <SidebarButton icon={<WarehouseIcon />} label="Warehouse" selected={currentRoute.includes('warehouse')} handleClick={() => handleRoute('/dashboard/warehouse')} />
                    </ListItem>
                </List>
            </nav>
        </Box>
    )
}
export default Sidebar;