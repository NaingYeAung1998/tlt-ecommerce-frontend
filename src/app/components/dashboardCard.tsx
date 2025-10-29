import { Box, Card, Grid, Typography } from "@mui/material";
import { JSX } from "react";

interface DashboardCardProps {
    icon: JSX.Element,
    title: string,
    amount: string
}

function DashboardCard({ icon, title, amount }: DashboardCardProps) {
    return (<>
        <Card sx={{ width: '100%', height: '100px' }}>
            <Grid container>
                <Grid size={4}>
                    <Box sx={{ paddingY: '28px', paddingX: '10px' }}>
                        {icon}
                    </Box>

                </Grid>
                <Grid size={8} sx={{ paddingY: '20px' }}>
                    <Typography variant="body2">{title}</Typography>
                    <Typography variant="body1" fontWeight={'bold'}>{amount}</Typography>
                </Grid>
            </Grid>
        </Card>

    </>)
}

export default DashboardCard;