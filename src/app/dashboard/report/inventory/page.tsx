"use client"

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Alert, Box, Button, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Select, { StylesConfig } from 'react-select';
import { ISelect } from '@/app/interfaces';
import { bindPerBagUnitHierarchy, calculateQuantityWithHierarchy, getAllUnitHierarchies } from '@/app/utils';
import { IWarehouse } from '../../warehouse/intefaces/warehouse.interfaces';
import { ICategory } from '../../category/interfaces/category.interface';
import { IProductList } from '../../product/interfaces/product.interface';
import { ISupplier } from '../../supplier/interfaces/supplier.interface';

interface InventoryRow {
    product_id: string;
    product_code: string;
    product_name: string;
    category: string;
    grade: string;
    product_per_bag_qty: string;
    product_per_bag_unit_id: string;
    current_stock: number | string;
    reserved: number | string;
    available: number | string;
}

interface Column {
    id: 'product_code' | 'product_name' | 'category' | 'grade' | 'current_stock' | 'reserved' | 'available';
    label: string;
    minWidth?: number;
    align?: 'right' | 'left';
}

const columns: readonly Column[] = [
    { id: 'product_code', label: 'Code', minWidth: 120 },
    { id: 'product_name', label: 'Product', minWidth: 180 },
    { id: 'category', label: 'Category', minWidth: 150 },
    { id: 'grade', label: 'Grade', minWidth: 130 },
    { id: 'current_stock', label: 'Current Stock', minWidth: 180 },
    { id: 'reserved', label: 'Reserved', minWidth: 180 },
    { id: 'available', label: 'Available', minWidth: 180 }
];

const sortOptions: ISelect[] = [
    { value: 'code', label: 'Code' },
    { value: 'highest', label: 'Highest' },
    { value: 'lowest', label: 'Lowest' }
];

export default function InventoryReport() {
    const [warehouse, setWarehouse] = useState<ISelect | null>(null);
    const [category, setCategory] = useState<ISelect | null>(null);
    const [product, setProduct] = useState<ISelect | null>(null);
    const [supplier, setSupplier] = useState<ISelect | null>(null);
    const [sortBy, setSortBy] = useState<ISelect>(sortOptions[0]);
    const [warehouseOptions, setWarehouseOptions] = useState<ISelect[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<ISelect[]>([]);
    const [productOptions, setProductOptions] = useState<ISelect[]>([]);
    const [supplierOptions, setSupplierOptions] = useState<ISelect[]>([]);
    const [rows, setRows] = useState<InventoryRow[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [totalLength, setTotalLength] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const selectStyles: StylesConfig<ISelect, false> = {
        control: (styles) => ({ ...styles, minHeight: '56px' }),
        menuPortal: (styles) => ({ ...styles, zIndex: 1400 })
    };

    const selectMenuProps = {
        menuPortalTarget: typeof document !== 'undefined' ? document.body : undefined,
        menuPosition: 'fixed' as const,
        styles: selectStyles
    };

    const loadFilterOptions = async () => {
        const [warehouseResponse, categoryResponse, productResponse, supplierResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}warehouse?perPage=-1`),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}category?perPage=-1`),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}product?perPage=-1`),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}supplier?perPage=-1`)
        ]);

        if (warehouseResponse.ok) {
            const result = await warehouseResponse.json();
            setWarehouseOptions(result.map((item: IWarehouse) => ({ value: item.warehouse_id, label: item.warehouse_name })));
        }
        if (categoryResponse.ok) {
            const result = await categoryResponse.json();
            setCategoryOptions(result.map((item: ICategory) => ({ value: item.category_id, label: item.category_name })));
        }
        if (productResponse.ok) {
            const result = await productResponse.json();
            setProductOptions(result.map((item: IProductList) => ({ value: item.product_id, label: item.product_name })));
        }
        if (supplierResponse.ok) {
            const result = await supplierResponse.json();
            setSupplierOptions(result.map((item: ISupplier) => ({ value: item.supplier_id, label: item.supplier_name })));
        }
    };

    const formatQuantities = async (data: InventoryRow[]) => {
        const unitHierarchies = await getAllUnitHierarchies();
        data.forEach((row) => {
            const unitHierarchy = unitHierarchies?.find((hierarchy) =>
                hierarchy.some((unit) => unit.unit_id === row.product_per_bag_unit_id)
            );
            if (!unitHierarchy) return;

            const hierarchy = bindPerBagUnitHierarchy(unitHierarchy, row.product_per_bag_unit_id, row.product_per_bag_qty);
            const lowestUnit = hierarchy[hierarchy.length - 1];
            (['current_stock', 'reserved', 'available'] as const).forEach((field) => {
                row[field] = calculateQuantityWithHierarchy(
                    hierarchy,
                    [{ unit_id: lowestUnit?.unit_id, quantity: row[field] }]
                ).quantityString;
            });
        });
    };

    const getReport = async (page = currentPage, pageSize = perPage) => {
        setLoading(true);
        setError('');
        const params = new URLSearchParams({
            sortBy: sortBy.value,
            currentPage: page.toString(),
            perPage: pageSize.toString()
        });
        if (warehouse) params.set('warehouseId', warehouse.value);
        if (category) params.set('categoryId', category.value);
        if (product) params.set('productId', product.value);
        if (supplier) params.set('supplierId', supplier.value);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}report/inventory?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to load the inventory report.');
            const result = await response.json();
            await formatQuantities(result.data);
            setRows(result.data);
            setTotalLength(result.totalLength);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Failed to load the inventory report.');
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
        // Filters are applied explicitly; this effect only loads the initial report.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>Inventory Report</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <Select isClearable options={warehouseOptions} value={warehouse} onChange={setWarehouse} placeholder="All warehouses" {...selectMenuProps} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <Select isClearable options={categoryOptions} value={category} onChange={setCategory} placeholder="All categories" {...selectMenuProps} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <Select isClearable options={productOptions} value={product} onChange={setProduct} placeholder="All products" {...selectMenuProps} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <Select isClearable options={supplierOptions} value={supplier} onChange={setSupplier} placeholder="All suppliers" {...selectMenuProps} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <Select options={sortOptions} value={sortBy} onChange={(option) => option && setSortBy(option)} {...selectMenuProps} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                            <Button fullWidth variant="contained" disabled={loading} onClick={applyFilters} sx={{ height: 44 }}>Apply Filters</Button>
                        </Grid>
                    </Grid>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Box>

                <TableContainer sx={{ height: '62vh' }}>
                    <Table aria-label="Inventory report" stickyHeader>
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
                                    {columns.map((column) => (
                                        <TableCell key={column.id} align={column.align}>{row[column.id]}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            {!loading && rows.length === 0 && (
                                <TableRow><TableCell colSpan={8} align="center">No inventory found.</TableCell></TableRow>
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
