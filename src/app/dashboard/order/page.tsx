"use client"

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Alert, Box, Button, Grid, IconButton, Input, InputAdornment, Typography } from '@mui/material';
import { Delete, Edit, Search as SearchIcon } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
import { KeyboardEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { MOMENT_FORMAT } from '@/app/constants';
import DeleteConfirmDialog from '@/app/components/deleteConfirmDialog';
import { IOrderList } from './interfaces/order.interface';
import { formatCurrency } from '@/app/utils';

interface Column {
    id: 'voucher_code' | 'customer_name' | 'total_amount' | 'total_paid' | 'created_on';
    label: string;
    minWidth?: number;
    align?: 'right' | 'left';
}

const columns: readonly Column[] = [
    { id: 'voucher_code', label: 'Voucher Code', minWidth: 170 },
    { id: 'customer_name', label: 'Customer', minWidth: 100 },
    {
        id: 'total_amount',
        label: 'Total Amount',
        minWidth: 170,
        align: 'left',
    },
    {
        id: 'total_paid',
        label: 'Total Paid',
        minWidth: 170,
        align: 'left',

    },
    {
        id: 'created_on',
        label: 'Created Date',
        minWidth: 170,
        align: 'left',
    },
];


export default function Orders() {
    const searchParams = useSearchParams();

    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0)
    const [perPage, setPerPage] = useState(10);
    const [rows, setRows] = useState<IOrderList[]>([]);
    const [totalLength, setTotalLength] = useState(0);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteSelected, setDeleteSeleceted] = useState<IOrderList | null>(null);
    const showSuccess = searchParams.get('showSuccess');
    const customer = searchParams.get('customer');
    const action = searchParams.get('action');

    const handleChangePage = (event: unknown, newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPerPage(+event.target.value);
        setCurrentPage(0);
    };

    const handleSearch = async (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            await getOrders()
        }
    }

    const handleDeleteSelect = (id: string) => {
        let selected = rows.find(x => x.order_id == id);
        if (selected) {
            setDeleteSeleceted(selected);
            setShowDeleteDialog(true);
        }
    }

    const handleDelete = async () => {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}order/${deleteSelected?.order_id}`
        let response = await fetch(url, {
            method: "DELETE"
        });
        if (response.ok) {
            handleDeleteClose()
        }
    }

    const handleDeleteClose = () => {
        setShowDeleteDialog(false);
        getOrders();
    }

    const getOrders = async () => {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}order?search=${search}&currentPage=${currentPage}&perPage=${perPage}`;
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            result.data.forEach((order: any) => {
                order.customer_name = order.customer_name ? order.customer_name : order.customer_relation_name
                order.total_amount = formatCurrency(order.total_amount)
                order.total_paid = formatCurrency(order.total_paid)
            })
            setRows(result.data);
            setTotalLength(result.totalLength)
        } else {

        }
    }

    useEffect(() => {
        getOrders();
    }, [])

    useEffect(() => {
        getOrders()
    }, [currentPage, perPage])

    return (
        <div>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Alert severity='success' hidden={!showSuccess}>{`Voucher for Customer ${customer} successfully ${action === 'update' ? 'updated' : 'created'}.`}</Alert>
                <Box sx={{ padding: 2 }}>
                    <div className='flex justify-end pb-5'>
                        <Link href={'/dashboard/order/create'}>
                            <Button variant='contained' color='primary'>Add Order</Button>
                        </Link>
                    </div>
                    <Grid container sx={{ paddingTop: '20px' }}>
                        <Grid size={6}>
                            <Typography variant='body1' fontWeight={'bold'}>Orders</Typography>
                        </Grid>
                        <Grid size={6}>
                            <div className='flex justify-end'>
                                <Input
                                    sx={{ fontSize: '15px' }}
                                    placeholder='Search...'
                                    id="input-with-icon-adornment"
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyUp={(e) => handleSearch(e)}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <SearchIcon />
                                        </InputAdornment>
                                    }
                                />
                            </div>
                        </Grid>
                    </Grid>

                </Box>
                <TableContainer sx={{ height: '70vh' }}>

                    <Table aria-label="sticky table" stickyHeader={true}>
                        <TableHead>
                            <TableRow>
                                <TableCell>No.</TableCell>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                .map((row, index) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.order_id}>
                                            <TableCell>{(currentPage * perPage) + index + 1}</TableCell>
                                            {columns.map((column) => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {column.id == 'created_on' ? moment(value).format(MOMENT_FORMAT) : value}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell align='right'>
                                                <div>
                                                    <Link href={'/dashboard/order/create?id=' + row.order_id}><IconButton color='default'><Edit /></IconButton></Link>
                                                    <IconButton color='warning' onClick={() => handleDeleteSelect(row.order_id)}><Delete /></IconButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
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
            <DeleteConfirmDialog open={showDeleteDialog} title={deleteSelected?.voucher_code} handleClose={handleDeleteClose} handleDelete={handleDelete} />
        </div>

    );
}