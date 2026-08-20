"use client"

import { AccountBalanceWallet, Paid, Percent, TrendingUp } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";
import Select from "react-select";
import { ISelect } from "@/app/interfaces";
import { formatCurrency } from "@/app/utils";
import { ICustomer } from "../../customer/interfaces/customer.interface";

interface DailySalesSummary {
    date: string;
    customer_id: string | null;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
}

const emptySummary: DailySalesSummary = {
    date: '',
    customer_id: null,
    revenue: 0,
    cost: 0,
    profit: 0,
    margin: 0
};

export default function DailySalesDashboard() {
    const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
    const [customer, setCustomer] = useState<ISelect | null>(null);
    const [customers, setCustomers] = useState<ISelect[]>([]);
    const [summary, setSummary] = useState<DailySalesSummary>(emptySummary);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getCustomers = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}customer?perPage=-1`);
        if (!response.ok) return;

        const result = await response.json();
        setCustomers(result.map((item: ICustomer) => ({
            value: item.customer_id,
            label: item.customer_name
        })));
    };

    const getSummary = async () => {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({ date });
        if (customer) params.set('customerId', customer.value);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}report/daily-sales-summary?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to load the daily sales summary.');
            setSummary(await response.json());
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Failed to load the daily sales summary.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCustomers();
        getSummary();
    }, []);

    const cards = [
        { title: 'Revenue', value: formatCurrency(summary.revenue), icon: <Paid />, color: '#1976d2', background: '#e3f2fd' },
        { title: 'Cost', value: formatCurrency(summary.cost), icon: <AccountBalanceWallet />, color: '#ed6c02', background: '#fff3e0' },
        { title: 'Profit', value: formatCurrency(summary.profit), icon: <TrendingUp />, color: summary.profit >= 0 ? '#2e7d32' : '#d32f2f', background: summary.profit >= 0 ? '#e8f5e9' : '#ffebee' },
        { title: 'Margin', value: `${summary.margin.toFixed(2)}%`, icon: <Percent />, color: '#7b1fa2', background: '#f3e5f5' }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h5" fontWeight={700}>Daily Sales Summary</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                Revenue, cost and profitability for the selected day.
            </Typography>

            <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Select
                                isClearable
                                options={customers}
                                value={customer}
                                onChange={setCustomer}
                                placeholder="All customers"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                                menuPosition="fixed"
                                styles={{
                                    control: (styles) => ({ ...styles, minHeight: '56px' }),
                                    menuPortal: (styles) => ({ ...styles, zIndex: 1400 })
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Button variant="contained" onClick={getSummary} disabled={loading || !date} sx={{ height: 44 }}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Apply Filters'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {cards.map((card) => (
                    <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body1" color="text.secondary" fontWeight={600}>{card.title}</Typography>
                                    <Box sx={{ display: 'flex', p: 1.25, borderRadius: 2, color: card.color, backgroundColor: card.background }}>
                                        {card.icon}
                                    </Box>
                                </Box>
                                <Typography variant="h5" fontWeight={700} color={card.title === 'Profit' ? card.color : 'text.primary'}>
                                    {card.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
