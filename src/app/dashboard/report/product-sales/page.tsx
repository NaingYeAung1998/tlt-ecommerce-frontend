"use client"

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Alert, Box, Button, Grid, TextField, Typography } from '@mui/material';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Select, { StylesConfig } from 'react-select';
import { ISelect } from '@/app/interfaces';
import { bindPerBagUnitHierarchy, calculateQuantityWithHierarchy, formatCurrency, getAllUnitHierarchies } from '@/app/utils';
import { ICategory } from '../../category/interfaces/category.interface';
import { IProductList } from '../../product/interfaces/product.interface';

interface ProductSalesRow {
    product_id: string;
    product_code: string;
    product_name: string;
    category: string;
    product_per_bag_qty: string;
    product_per_bag_unit_id: string;
    quantity_sold: number | string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
}

interface Column {
    id: 'product_code' | 'product_name' | 'category' | 'quantity_sold' | 'revenue' | 'profit' | 'margin';
    label: string;
    minWidth?: number;
    align?: 'right' | 'left';
}

const columns: readonly Column[] = [
    { id: 'product_code', label: 'Code', minWidth: 120 },
    { id: 'product_name', label: 'Product', minWidth: 180 },
    { id: 'category', label: 'Category', minWidth: 150 },
    { id: 'quantity_sold', label: 'Qty Sold', minWidth: 120, align: 'right' },
    { id: 'revenue', label: 'Revenue', minWidth: 150, align: 'right' },
    { id: 'profit', label: 'Profit', minWidth: 150, align: 'right' },
    { id: 'margin', label: 'Margin %', minWidth: 120, align: 'right' }
];

const sortOptions: ISelect[] = [
    { value: 'best-sellers', label: 'Best Sellers' },
    { value: 'slow-movers', label: 'Slow Movers' }
];

export default function ProductSalesReport() {
    const [fromDate, setFromDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
    const [category, setCategory] = useState<ISelect | null>(null);
    const [product, setProduct] = useState<ISelect | null>(null);
    const [sortBy, setSortBy] = useState<ISelect>(sortOptions[0]);
    const [categoryOptions, setCategoryOptions] = useState<ISelect[]>([]);
    const [productOptions, setProductOptions] = useState<ISelect[]>([]);
    const [rows, setRows] = useState<ProductSalesRow[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [totalLength, setTotalLength] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const portalStyles: StylesConfig<ISelect, false> = {
        control: (styles) => ({ ...styles, minHeight: '56px' }),
        menuPortal: (styles) => ({ ...styles, zIndex: 1400 })
    };

    const loadFilterOptions = async () => {
        const [categoryResponse, productResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}category?perPage=-1`),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}product?perPage=-1`)
        ]);

        if (categoryResponse.ok) {
            const result = await categoryResponse.json();
            setCategoryOptions(result.map((item: ICategory) => ({ value: item.category_id, label: item.category_name })));
        }
        if (productResponse.ok) {
            const result = await productResponse.json();
            setProductOptions(result.map((item: IProductList) => ({ value: item.product_id, label: item.product_name })));
        }
    };

    const getReport = async (page = currentPage, pageSize = perPage) => {
        setLoading(true);
        setError('');
        const params = new URLSearchParams({
            fromDate,
            toDate,
            sortBy: sortBy.value,
            currentPage: page.toString(),
            perPage: pageSize.toString()
        });
        if (category) params.set('categoryId', category.value);
        if (product) params.set('productId', product.value);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}report/product-sales?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to load the product sales report.');
            const result = await response.json();
            const unitHierarchies = await getAllUnitHierarchies();
            result.data.forEach((row: ProductSalesRow) => {
                const unitHierarchy = unitHierarchies?.find((hierarchy) =>
                    hierarchy.some((unit) => unit.unit_id === row.product_per_bag_unit_id)
                );
                if (unitHierarchy) {
                    const perBagUnitHierarchy = bindPerBagUnitHierarchy(
                        unitHierarchy,
                        row.product_per_bag_unit_id,
                        row.product_per_bag_qty
                    );
                    const lowestUnit = perBagUnitHierarchy[perBagUnitHierarchy.length - 1];
                    row.quantity_sold = calculateQuantityWithHierarchy(
                        perBagUnitHierarchy,
                        [{ unit_id: lowestUnit?.unit_id, quantity: row.quantity_sold }]
                    ).quantityString;
                }
            });
            setRows(result.data);
            setTotalLength(result.totalLength);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Failed to load the product sales report.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        setCurrentPage(0);
        getReport(0, perPage);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setCurrentPage(newPage);
        getReport(newPage, perPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPerPage = Number(event.target.value);
        setPerPage(newPerPage);
        setCurrentPage(0);
        getReport(0, newPerPage);
    };

    useEffect(() => {
        loadFilterOptions();
        getReport(0, perPage);
        // The initial report should load once; later filter changes are applied explicitly.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box >
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>Product Sales Report</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <TextField fullWidth type="date" label="From Date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <TextField fullWidth type="date" label="To Date" value={toDate} onChange={(event) => setToDate(event.target.value)} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <Select isClearable options={categoryOptions} value={category} onChange={setCategory} placeholder="All categories" menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined} menuPosition="fixed" styles={portalStyles} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <Select isClearable options={productOptions} value={product} onChange={setProduct} placeholder="All products" menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined} menuPosition="fixed" styles={portalStyles} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <Select options={sortOptions} value={sortBy} onChange={(option) => option && setSortBy(option)} menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined} menuPosition="fixed" styles={portalStyles} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <Button fullWidth variant="contained" disabled={loading || !fromDate || !toDate} onClick={applyFilters} sx={{ height: 44 }}>Apply Filters</Button>
                        </Grid>
                    </Grid>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Box>

                <TableContainer sx={{ height: '62vh' }}>
                    <Table aria-label="Product sales report" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>No.</TableCell>
                                {columns.map((column) => (
                                    <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.product_id}>
                                    <TableCell>{currentPage * perPage + index + 1}</TableCell>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        const displayValue = column.id === 'revenue' || column.id === 'profit'
                                            ? formatCurrency(Number(value))
                                            : column.id === 'margin'
                                                ? `${Number(value).toFixed(2)}%`
                                                : value;
                                        return <TableCell key={column.id} align={column.align}>{displayValue}</TableCell>;
                                    })}
                                </TableRow>
                            ))}
                            {!loading && rows.length === 0 && (
                                <TableRow><TableCell colSpan={8} align="center">No product sales found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={totalLength}
                    rowsPerPage={perPage}
                    page={currentPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
