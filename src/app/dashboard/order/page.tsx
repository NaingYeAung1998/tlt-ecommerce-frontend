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
import { Delete, Edit, History, Payments, Search as SearchIcon } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { MOMENT_FORMAT } from '@/app/constants';
import DeleteConfirmDialog from '@/app/components/deleteConfirmDialog';
import { IOrder, IOrderList, IOrderPayment } from './interfaces/order.interface';
import { bindPerBagUnitHierarchy, calculateQuantityWithHierarchy, calculateRoundUpUnit, formatCurrency, getAllUnitHierarchies } from '@/app/utils';
import Select from 'react-select'
import { IProduct } from '../product/interfaces/product.interface';
import { ISelect } from '@/app/interfaces';
import QuantityCalculator from '@/app/components/quantityCalculator';

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
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [deleteSelected, setDeleteSeleceted] = useState<IOrderList | null>(null);
    const [paymentSelectedOrder, setPaymentSelectedOrder] = useState("");
    const [showOrderTrackDialog, setShowOrderTrackDialog] = useState(false);
    const [orderTrackSelectedOrder, setOrderTrackSelectedOrder] = useState("");
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
                order.total_amount = formatCurrency(parseFloat(order.total_amount) + parseFloat(order.other_charges))
                order.total_paid = formatCurrency(order.total_paid)
            })
            setRows(result.data);
            setTotalLength(result.totalLength)
        } else {

        }
    }

    const handlePaymentModalClose = () => {
        setShowPaymentDialog(false);
        getOrders();
    }

    const handleOrderTrackModalClose = () => {
        setShowOrderTrackDialog(false);
        getOrders();
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
                                                    <IconButton onClick={() => { setOrderTrackSelectedOrder(row.order_id); setShowOrderTrackDialog(true) }}><History /></IconButton>
                                                    <IconButton onClick={() => { setPaymentSelectedOrder(row.order_id); setShowPaymentDialog(true) }}><Payments /></IconButton>
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
            <Modal open={showPaymentDialog} onClose={handlePaymentModalClose}>
                <AddPaymentModal order_id={paymentSelectedOrder} close={handlePaymentModalClose} />
            </Modal>
            <Modal open={showOrderTrackDialog} onClose={handleOrderTrackModalClose}>
                <AddOrderTrackModal order_id={orderTrackSelectedOrder} close={handleOrderTrackModalClose} />
            </Modal>
        </div>

    );
}

type AddPaymentModalProps = {
    order_id: string,
    close: () => void
}
export const AddPaymentModal: FC<AddPaymentModalProps> = ({ order_id, close }) => {
    const today = new Date();
    const initPayment = (length: number): IOrderPayment => {
        return { order_payment_id: (length + 1).toString(), amount: '0', payment_date: today.toISOString().split('T')[0], payment_channel: '', note: '' }
    }
    const [order, setOrder] = useState<IOrder>({} as IOrder)
    const [payment, setPayment] = useState<IOrderPayment>(initPayment(0))
    const [payments, setPayments] = useState<any[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const amountRef = useRef<HTMLInputElement>(null);

    const getOrder = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "order"
        let response = await fetch(url + "/" + order_id);
        if (response.ok) {
            let result = await response.json();
            if (result.items) {
                const amount = result.items.reduce((prev: any, current: any) => prev + parseFloat(current.selling_price), 0)
                setTotalAmount(amount);
            }
            setOrder(result);
            setPayments(result.payments)
        }
    }

    const handleSave = async () => {
        const data = { ...order };
        data.payments = [];
        payments.forEach((payment: any) => {
            data.payments.push({ amount: payment.amount, payment_date: payment.payment_date, payment_channel: payment.payment_channel, note: payment.note })
        })
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "order/payments/" + order_id
        let response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        if (response.ok) {
            close();
        } else {

        }
    }

    const handleAddOrUpdatePayment = () => {
        const currentPayments = [...payments];
        const currentPayment = { ...payment };
        let orderPayment = currentPayments.find(x => x.order_payment_id == currentPayment.order_payment_id);
        if (orderPayment) {
            let index = currentPayments.indexOf(orderPayment);
            currentPayments[index] = currentPayment;
            setPayments(currentPayments);
            setPayment(initPayment(currentPayments.length));
        } {
            currentPayments.push(currentPayment);
            setPayments(currentPayments);
            setPayment(initPayment(currentPayments.length));
        }
    }

    const handleEditPayment = (id?: string) => {
        const currentPayments = [...payments];
        const payment = currentPayments.find(x => x.order_payment_id == id);
        if (payment) {
            setPayment(payment)
        }
    }

    const handlePaymentChange = (field: 'amount' | 'payment_date' | 'payment_channel' | 'note', value: string) => {
        let prevPayment = { ...payment };
        prevPayment[field] = value;
        setPayment(prevPayment);
    }

    const handleDeletePayment = (payment_id: string) => {
        setPayments((prev: any) => prev.filter((x: any) => x.order_payment_id != payment_id))
    }

    useEffect(() => {
        getOrder()
        if (amountRef && amountRef.current) {
            amountRef.current.focus();
            amountRef.current.select();
        }
    }, [])

    const paymentTotal = payments.reduce((prev, current) => prev + parseFloat(current.amount), 0)
    return (
        <>
            <div className="pt-[20px] flex items-center justify-center mt-[20vh]">
                <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px', width: { md: '70%' } }}>
                    <div className='flex gap-10'>
                        <div className='w-[50%]'>
                            <Typography variant="body1" fontWeight={'bold'}>Add Payment</Typography>
                            <Grid container columnSpacing={4} sx={{ paddingBottom: '20px' }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <div className="pt-[20px]">
                                        <TextField inputRef={amountRef} variant="outlined" placeholder="Amount" value={payment.amount} sx={{ width: { xs: '100%', lg: '100%' } }} onChange={(e) => handlePaymentChange("amount", e.target.value)} />
                                    </div>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <div className="pt-[20px]">
                                        <input type='date' value={payment.payment_date} onChange={(e) => handlePaymentChange("payment_date", e.target.value)} />
                                    </div>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <div className="pt-[20px]">
                                        <TextField variant="outlined" placeholder="Channel" value={payment.payment_channel} sx={{ width: { xs: '100%', lg: '100%' } }} onChange={(e) => handlePaymentChange("payment_channel", e.target.value)} />
                                    </div>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <div className="pt-[20px]">
                                        <TextField variant="outlined" placeholder="Note" value={payment.note} sx={{ width: { xs: '100%', lg: '100%' } }} onChange={(e) => handlePaymentChange("note", e.target.value)} />
                                    </div>
                                </Grid>
                            </Grid>
                            <div className="flex justify-start pt-[20px] gap-4">
                                {payments.map((payment: any) => payment.order_payment_id).includes(payment.order_payment_id) ? <Button variant="outlined" color="warning" onClick={() => setPayment(initPayment(payments.length))}>Cancel</Button> : <></>}
                                <Button variant="contained" color="primary" onClick={() => handleAddOrUpdatePayment()}>{payments.map((payment: any) => payment.order_payment_id).includes(payment.order_payment_id) ? 'Update' : 'Add'}</Button>
                            </div>
                            <div className="p-[20px]">

                            </div>
                        </div>
                        <div className='w-[50%]'>
                            <>
                                <Typography variant="body1" fontWeight={'bold'}>Payments</Typography>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Payment Date</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            payments.map((payment: any, index: number) =>
                                                <TableRow>

                                                    <TableCell><Typography variant="body2" fontWeight={'bold'}>{payment.payment_date}</Typography></TableCell>
                                                    <TableCell><Typography variant="body2" fontWeight={'bold'}>{formatCurrency(payment.amount)}</Typography></TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            )

                                        }
                                        <TableRow>

                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>Total Paid</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>{formatCurrency(paymentTotal)}</Typography></TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                        <TableRow>

                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>Unpaid</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>{formatCurrency(totalAmount - paymentTotal)}</Typography></TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                            </>
                            <br />
                            <div className='flex justify-end gap-3'>
                                <Button variant="outlined" color="warning" onClick={() => close()}>Cancel</Button>
                                <Button variant="contained" color="primary" onClick={() => handleSave()}>{'Save'}</Button>
                            </div>
                        </div>
                    </div>


                </Box>
            </div>
        </>
    )
}

type AddOrderTrackModalProps = {
    order_id: string,
    close: () => void
}

export const AddOrderTrackModal: FC<AddOrderTrackModalProps> = ({ order_id, close }) => {
    const today = new Date();
    const initItem = (length: number, currentItems: any[] = []) => {
        if (length == 0) {
            return { track_id: (length + 1).toString(), item: { unitHierarchy: [] }, checked_date: today.toISOString().split('T')[0] }
        } else {
            console.log(trackItems)
            return { track_id: (parseFloat(currentItems[currentItems.length - 1].track_id) + 1).toString(), item: { unitHierarchy: [] }, checked_date: today.toISOString().split('T')[0] }
        }

    }
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [trackItem, setTrackItem] = useState<any>(initItem(0));
    const [trackItems, setTrackItems] = useState<any[]>([]);
    const productOptions: ISelect[] = orderItems.map((item, index) => { return { label: item.product?.product_name, value: item.product?.product_id } });
    const productOption: ISelect | null = trackItem ? { label: trackItem.item.product?.product_name, value: trackItem.item.product?.product_id } : null;

    const getOrder = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "order"
        let response = await fetch(url + "/" + order_id);
        if (response.ok) {
            let result = await response.json();
            const unitHierarchies = await getAllUnitHierarchies();
            let trackItemsModel: any[] = []
            result.items.map((item: any, index: number) => {
                const unitHierarchy = unitHierarchies?.find(x => x.some(y => y.unit_id == item.product?.per_bag_unit?.unit_id))
                if (unitHierarchy) {
                    const perBagUnitHierarchy = bindPerBagUnitHierarchy(unitHierarchy, item.product?.per_bag_unit?.unit_id, item.product?.quantity_per_bag);
                    let formattedQuantity = calculateQuantityWithHierarchy(perBagUnitHierarchy, [{ unit_id: item.unit?.unit_id, quantity: item.quantity }])
                    item.quantityString = formattedQuantity.quantityString;
                    item.unitHierarchy = unitHierarchy
                }
                item.itemTracks.map((track: any, j: any) => {
                    let quantityString = ""
                    if (unitHierarchy) {
                        const perBagUnitHierarchy = bindPerBagUnitHierarchy(unitHierarchy, item.product?.per_bag_unit?.unit_id, item.product?.quantity_per_bag);
                        let formattedQuantity = calculateQuantityWithHierarchy(perBagUnitHierarchy, [{ unit_id: item.unit?.unit_id, quantity: track.quantity }])
                        quantityString = formattedQuantity.quantityString;
                    }
                    const trackItemModel = {
                        checked_date: track.checked_date,
                        quantity: track.quantity,
                        unit: track.unit,
                        status: 0,
                        note: track.note,
                        item: item,
                        quantityString: quantityString
                    }
                    trackItemsModel.push(trackItemModel)
                })
            })
            console.log(trackItemsModel)
            setTrackItems(trackItemsModel)
        }
    }

    const getOrderItems = async () => {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}order-items/${order_id}`;
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            const unitHierarchies = await getAllUnitHierarchies();
            result.map((item: any) => {
                const unitHierarchy = unitHierarchies?.find(x => x.some(y => y.unit_id == item.product?.per_bag_unit?.unit_id))
                if (unitHierarchy) {
                    const perBagUnitHierarchy = bindPerBagUnitHierarchy(unitHierarchy, item.product?.per_bag_unit?.unit_id, item.product?.quantity_per_bag);
                    let formattedQuantity = calculateQuantityWithHierarchy(perBagUnitHierarchy, [{ unit_id: item.unit?.unit_id, quantity: item.quantity }])
                    item.quantityString = formattedQuantity.quantityString;
                    item.unitHierarchy = unitHierarchy
                }
            })
            setOrderItems(result)

        } else {
        }

    }

    const handleProductChange = (option: ISelect | null) => {
        if (option) {
            const productItem = orderItems.find(x => x.product?.product_id == option.value);
            let prevTrackItem = { ...trackItem }
            prevTrackItem.item = productItem;
            prevTrackItem.quantity = productItem.quantity;
            prevTrackItem.unit = { unit_id: productItem?.unit?.unit_id }
            setTrackItem(prevTrackItem)
        } else {
            let prevTrackItem = { ...trackItem }
            prevTrackItem.item = { unitHierarchy: [] }
            setTrackItem(prevTrackItem)
        }
    }

    const handleQuantityChange = (qty: number, unitId: string) => {
        let prevItem = { ...trackItem }
        prevItem.quantity = qty;
        prevItem.unit = { unit_id: unitId }
        let roundupQuantity = calculateRoundUpUnit(prevItem.item.unitHierarchy, qty)
        let roundupQuantityString = '';
        roundupQuantity.forEach((qty) => {
            roundupQuantityString += `${qty.quantity} ${qty.unit_name} `;
        })
        prevItem.quantityString = roundupQuantityString;
        setTrackItem(prevItem)
    }

    const handleAddOrUpdateItem = () => {
        const allTrackItems = [...trackItems];
        const productRelatedTracks = allTrackItems.filter(x => x.item?.product?.product_id == trackItem.item?.product?.product_id && x.track_id != trackItem.track_id);
        const totalQty = productRelatedTracks.reduce((prev: any, current: any) => prev += parseFloat(current.quantity), 0)
        if (parseFloat(trackItem.quantity) + totalQty > parseFloat(trackItem.item.quantity)) {

        } else {
            const currentItems = [...trackItems];
            const currentItem = { ...trackItem };
            let trackOrderItem = currentItems.find(x => x.track_id == currentItem.track_id);
            if (trackOrderItem) {
                let index = currentItems.indexOf(trackOrderItem);
                currentItems[index] = currentItem;
                setTrackItems(currentItems);
                setTrackItem(initItem(currentItems.length, currentItems));
            } {
                currentItems.push(currentItem);
                console.log(currentItems)
                setTrackItems(currentItems);
                setTrackItem(initItem(currentItems.length, currentItems));
            }
        }
    }

    const handleTrackChange = (field: string, value: string) => {
        const prevItem = { ...trackItem };
        prevItem[field] = value;
        setTrackItem(prevItem)
    }

    const handleSave = async () => {
        if (trackItems.length > 0) {
            let requestTrackItems: any[] = [];
            trackItems.forEach((item, index) => {
                const trackItem = {
                    checked_date: item.checked_date,
                    quantity: item.quantity,
                    unit: item.unit,
                    status: 0,
                    note: item.note,
                    order_item: { order_item_id: item.item.order_item_id }
                }
                requestTrackItems.push(trackItem);
            })
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "order/tracks/" + order_id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestTrackItems)
            })
            if (response.ok) {
                close();
            } else {

            }
        }
    }

    useEffect(() => {
        getOrder();
        getOrderItems();
    }, [])

    return (
        <>
            <div className="pt-[20px] flex items-center justify-center mt-[20vh]">
                <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px', width: { md: '70%' } }}>
                    <div className='flex gap-10'>
                        <div className='w-[50%]'>
                            <Typography variant="body1" fontWeight={'bold'}>Add Track</Typography>
                            <Grid container columnSpacing={4} sx={{ paddingBottom: '20px' }}>
                                <Grid size={{ sm: 12, md: 6 }}>
                                    <div className='pt-[20px]'>
                                        <Select options={productOptions} placeholder='Stocks' styles={{
                                            control: (styles) => ({ ...styles, width: '100%', height: '60px' }),
                                            menu: (styles) => ({ ...styles, width: '100%' }),
                                            menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '50%' })
                                        }}
                                            value={productOption}
                                            onChange={(option) => handleProductChange(option)}
                                        />
                                    </div>

                                </Grid>
                                <Grid size={{ sm: 12, md: 6 }}>
                                    <div className='pt-[20px]'>
                                        <QuantityCalculator unitHierarchy={trackItem.item?.unitHierarchy} parentId={trackItem.item?.order_item_id} parentQty={trackItem.item?.quantity} parentUnitId={trackItem.item?.unit?.unit_id} updateParent={handleQuantityChange} />
                                    </div>

                                </Grid>
                                <Grid size={{ sm: 12, md: 6 }}>
                                    <div className='pt-[20px]'>
                                        <input type='date' value={trackItem.checked_date} onChange={(e) => handleTrackChange("checked_date", e.target.value)} />
                                    </div>

                                </Grid>
                            </Grid>
                            <div className="flex justify-start pt-[20px] gap-4">
                                {trackItems.map((track: any) => track.track_id).includes(trackItem.track_id) ? <Button variant="outlined" color="warning" onClick={() => setTrackItem(initItem(trackItems.length))}>Cancel</Button> : <></>}
                                <Button variant="contained" color="primary" onClick={() => handleAddOrUpdateItem()}>{trackItems.map((track: any) => track.track_id).includes(trackItem.track_id) ? 'Update' : 'Add'}</Button>
                            </div>
                            <div className="p-[20px]">

                            </div>
                        </div>
                        <div className='w-[50%]'>
                            <>
                                <Typography variant="body1" fontWeight={'bold'}>Track Items</Typography>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Checked Date</TableCell>
                                            <TableCell>Product</TableCell>
                                            <TableCell>Quantity</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            trackItems.map((track: any, index: number) =>
                                                <TableRow>

                                                    <TableCell><Typography variant="body2" fontWeight={'bold'}>{track.checked_date}</Typography></TableCell>
                                                    <TableCell><Typography variant="body2" fontWeight={'bold'}>{track.item?.product?.product_name}</Typography></TableCell>
                                                    <TableCell><Typography variant="body2" fontWeight={'bold'}>{track.quantityString}</Typography></TableCell>
                                                </TableRow>
                                            )

                                        }
                                    </TableBody>
                                </Table>

                            </>
                            <br />
                            <div className='flex justify-end gap-3'>
                                <Button variant="outlined" color="warning" onClick={() => close()}>Cancel</Button>
                                <Button variant="contained" color="primary" onClick={() => handleSave()}>{'Save'}</Button>
                            </div>
                        </div>
                    </div>


                </Box>
            </div>
        </>
    )
}