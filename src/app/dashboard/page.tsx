import { Box, Grid } from "@mui/material";
import DashboardCard from "../components/dashboardCard";
import { AccountBox as AccountBoxIcon, Apps as AppsIcon, MonetizationOn as MonetizationOnIcon, PointOfSale as PointOfSaleIcon } from "@mui/icons-material";
import BarChart from "../components/dashboardBarChart";
import DoughnutChart from "../components/dashboardDoughnutChart";

function Dashboard() {
    return (
        <Box sx={{}}>
            <Grid container spacing={4}>
                <Grid size={{ xs: 6, lg: 3 }}>
                    <DashboardCard icon={<AppsIcon sx={{ color: '#C6B38E' }} />} title="Total Products" amount="165" />
                </Grid>
                <Grid size={{ xs: 6, lg: 3 }}>
                    <DashboardCard icon={<PointOfSaleIcon sx={{ color: '#9A9B73' }} />} title="Total Sale" amount="100,3400" />
                </Grid>
                <Grid size={{ xs: 6, lg: 3 }}>
                    <DashboardCard icon={<MonetizationOnIcon sx={{ color: '#442F38' }} />} title="Total Profit" amount="56,700" />
                </Grid>
                <Grid size={{ xs: 6, lg: 3 }}>
                    <DashboardCard icon={<AccountBoxIcon />} title="Customers" amount="2,900" />
                </Grid>
            </Grid>
            <Grid container spacing={4} sx={{ paddingY: 10 }}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <BarChart />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <DoughnutChart />
                </Grid>
            </Grid>

        </Box>
    )
}

export default Dashboard;