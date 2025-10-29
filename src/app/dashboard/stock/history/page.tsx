"use client"

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { SyntheticEvent, useState } from 'react';
import { Paper } from '@mui/material';
import Tracks from './track';
import { useSearchParams } from 'next/navigation';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}


export default function StockHistory() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || '';

    const [tab, setTab] = useState(0)

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={handleChange}>
                        <Tab label="Stocks" sx={{ width: '50% !important', maxWidth: 'none' }} />
                        <Tab label="Payments" sx={{ width: '50% !important', maxWidth: 'none' }} />
                    </Tabs>
                </Box>
                <CustomTabPanel value={tab} index={0}>
                    <Tracks stock_id={id} />
                </CustomTabPanel>
                <CustomTabPanel value={tab} index={1}>
                    Item Two
                </CustomTabPanel>
            </Box>
        </Paper>

    );
}
