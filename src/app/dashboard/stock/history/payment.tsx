"use client"

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Alert, Box, Button, Grid, IconButton, Input, InputAdornment, Modal, TextField, Typography } from '@mui/material';
import { Delete, Edit, Search as SearchIcon } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
import { FC, KeyboardEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { MOMENT_FORMAT, TRACK_STATUS_LIST } from '@/app/constants';
import { AddTrackProps, ITrack, ITrackList, StockTrackProps } from '../interfaces/track.interface';
import Select from 'react-select'
import { ISelect } from '@/app/interfaces';
import { IWarehouse } from '../../warehouse/intefaces/warehouse.interfaces';
import { AddPaymentProps, IPayment, IPaymentInfo, StockPaymentProps } from '../interfaces/payment.inteface';

interface Column {
    id: 'amount_formatted' | 'payment_date' | 'payment_channel' | 'note' | 'created_on';
    label: string;
    minWidth?: number;
    align?: 'right' | 'left';
}

const columns: readonly Column[] = [
    { id: 'amount_formatted', label: 'Amount', minWidth: 170 },
    { id: 'payment_date', label: 'Payment Date', minWidth: 100 },
    { id: 'payment_channel', label: 'Channel', minWidth: 100 },
    {
        id: 'note',
        label: 'Note',
        minWidth: 100,
        align: 'left',

    },
    {
        id: 'created_on',
        label: 'Created Date',
        minWidth: 170,
        align: 'left',
    },
];


const Payments: FC<StockPaymentProps> = ({ stock_id }) => {
    const searchParams = useSearchParams();

    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0)
    const [perPage, setPerPage] = useState(10);
    const [rows, setRows] = useState<IPayment[]>([]);
    const [totalLength, setTotalLength] = useState(0);
    const [addPaymentModal, setAddPaymentModal] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState('');
    const [paymentInfo, setPaymentInfo] = useState<IPaymentInfo>({} as IPaymentInfo);
    const showSuccess = searchParams.get('showSuccess');


    const handleChangePage = (event: unknown, newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPerPage(+event.target.value);
        setCurrentPage(0);
    };

    const handleSearch = async (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            await getPayments()
        }
    }

    const handleAddPaymentModalClose = () => {
        setAddPaymentModal(false);
    }

    const getPayments = async () => {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}stock/payment/getByStock?stock_id=${stock_id}&search=${search}&currentPage=${currentPage}&perPage=${perPage}`;
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            setRows(result.data);
            setTotalLength(result.totalLength)
        } else {

        }
    }

    const getPaymentInfo = async () => {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}stock/payment/getInfo/${stock_id}`;
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            setPaymentInfo(result);
        } else {

        }
    }

    const handleRefresh = () => {
        getPayments();
        getPaymentInfo();
    }

    useEffect(() => {
        getPayments();
        getPaymentInfo();
    }, [])

    useEffect(() => {
        getPayments()
    }, [currentPage, perPage])

    return (
        <div>
            <Box sx={{ padding: 2 }}>
                <div className='sm:flex justify-between pb-5'>
                    <div className='text-[16px]'> <Typography color='#777777'>Stock</Typography>  {paymentInfo?.stock_code} </div>
                    <div className='text-[16px]'><Typography color='#777777'>Product</Typography>  {paymentInfo?.stock_product} </div>
                    <div className='text-[16px]'><Typography color='#777777'>Amount</Typography>  {paymentInfo?.buying_price_formatted} </div>
                    <div className='text-[16px]'><Typography color='#777777'>Total Paid</Typography>   {paymentInfo?.total_paid_formatted} </div>
                    <div className='flex justify-end'>
                        <Button variant='contained' color='primary' onClick={() => { setSelectedPaymentId(''); setAddPaymentModal(true) }}>Add Payment</Button>
                    </div>

                </div>
                <Grid container sx={{ paddingTop: '20px' }}>
                    <Grid size={6}>
                        <Typography variant='body1' fontWeight={'bold'}>Payments</Typography>
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
            <TableContainer sx={{ height: '58vh' }}>

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
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.payment_id}>
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
                                                <IconButton color='default' onClick={() => { setSelectedPaymentId(row.payment_id); setAddPaymentModal(true) }}><Edit /></IconButton>
                                                <IconButton color='warning'><Delete /></IconButton>
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

            <Modal open={addPaymentModal} onClose={handleAddPaymentModalClose} disableEscapeKeyDown={false}>
                <AddPayment stock_id={stock_id} handleClose={handleAddPaymentModalClose} payment_id={selectedPaymentId} handleRefresh={handleRefresh} />
            </Modal>
        </div>

    );
}

const AddPayment: FC<AddPaymentProps> = ({ stock_id, handleClose, payment_id, handleRefresh }) => {

    const [payment, setPayment] = useState<IPayment>({ stock: { stock_id } } as IPayment)
    const today = new Date()
    const [paymentDate, setPaymentDate] = useState(today.toISOString().split('T')[0]);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (field: 'amount' | 'checked_date' | 'payment_channel' | 'note', value: string) => {
        setPayment({ ...payment, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...payment };
        data.payment_date = paymentDate;
        data.stock = { stock_id: stock_id }
        if (payment_id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock/payment/" + payment_id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                handleRefresh();
                handleClose();
            } else {
                let error = await response.json();
                setErrorMessage(error?.message);
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock/payment"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                handleRefresh();
                handleClose();
            } else {
                let error = await response.json();
                setErrorMessage(error?.message);
                setShowError(true)
            }
        }
    }

    const getExistingPayment = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock/payment"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            setPayment(result);
            setPaymentDate(result.payment_date);

        }
    }

    useEffect(() => {
        if (payment_id) {
            getExistingPayment(payment_id);
        }
    }, [])

    return (
        <div className='flex items-center justify-center mt-[20vh]'>
            <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px', width: '50%' }}>
                <Alert severity="error" hidden={!showError}><div className="flex items-center gap-2">{`Failed to create track: `} <Typography fontWeight={'bold'}>{errorMessage}</Typography></div></Alert>
                <br />

                <Typography variant="body1" fontWeight={'bold'}>Add Payment</Typography>

                <Grid container columnSpacing={4} sx={{ paddingBottom: '20px' }}>
                    <Grid size={6}>
                        <div className="pt-[20px]">
                            <TextField type='number' InputLabelProps={{ shrink: !!payment.amount }} value={payment.amount} onChange={(e) => { handleInputChange("amount", e.target.value) }} variant="outlined" label="Amount" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={6}>
                        <div className="pt-[20px]">
                            <TextField InputLabelProps={{ shrink: !!payment.payment_channel }} value={payment.payment_channel} onChange={(e) => { handleInputChange("payment_channel", e.target.value) }} variant="outlined" label="Channel" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={6}>
                        <div className="pt-[20px]">
                            <TextField InputLabelProps={{ shrink: !!payment.note }} value={payment.note} onChange={(e) => { handleInputChange("note", e.target.value) }} variant="outlined" label="Note" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={6}>
                        <div className="pt-[20px]">
                            <div className='w-[100%] border-[#CCCCCC] border-[1px] h-[55px] rounded-[7px] justify-center flex items-center'>
                                <label className='text-[#777777]'>Payment Date - &nbsp; &nbsp;</label>
                                <input type='date' value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                            </div>
                        </div>
                    </Grid>
                </Grid>


                <div className="flex justify-end pt-[20px] gap-4">
                    <Button variant="outlined" color="warning" onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={() => handleSave()}>{payment_id ? 'Update' : 'Create'}</Button>
                </div>

            </Box>
        </div>

    )
}

export default Payments;