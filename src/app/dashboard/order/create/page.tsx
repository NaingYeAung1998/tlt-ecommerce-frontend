"use client"

import { Alert, Box, Button, Grid, IconButton, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Ref, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Select from 'react-select'
import { ISupplier } from "../../supplier/interfaces/supplier.interface";
import { ISelect } from "@/app/interfaces";
import { IStockList } from "../../stock/interfaces/stock.interface";
import { Add as AddIcon, Delete as DeleteIcon, PlusOne } from "@mui/icons-material";
import { calculateLowestUnitQuantity, calculateQuantityWithProduct, calculateRoundUpUnit, formatCurrency, generateReceiptBuffer, handleNextFocus } from "@/app/utils";
import { IUnitList } from "../../unit/interfaces/unit.interface";
import { IOrder, IOrderItem, IOrderItemDisplay, IOrderPayment } from "../interfaces/order.interface";
import { ICustomer } from "../../customer/interfaces/customer.interface";
import OrderItem, { OrderItemDisplay } from "@/app/components/orderItem";
import { IProductList } from "../../product/interfaces/product.interface";
import Creatable, { useCreatable } from 'react-select/creatable';
import { Divider } from "@/app/components/divider";

function AddOrder() {

    let today = new Date();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [order, setOrder] = useState<IOrder>({} as IOrder)
    const [orderItems, setOrderItems] = useState<IOrderItemDisplay[]>([])
    const initItem = (length: number): IOrderItem => {
        return { item_id: (length + 1).toString(), quantity: 0, missing_quantity: 0, unitHierarchy: [], productStocks: [] }
    }
    const initPayment = (length: number): IOrderPayment => {
        return { order_payment_id: (length + 1).toString(), amount: '0', payment_date: '' }
    }
    const [item, setItem] = useState<IOrderItemDisplay>(initItem(0) as IOrderItemDisplay)
    const [payment, setPayment] = useState<IOrderPayment>(initPayment(0))
    const [customerList, setCustomerList] = useState<ISelect[]>([])
    const [products, setProducts] = useState<IProductList[]>([])
    const [fullyPaid, setFullyPaid] = useState(!id);
    const [customer, setCustomer] = useState<ISelect | null>(null)
    const [orderDate, setOrderDate] = useState(today.toISOString().split('T')[0])
    const [payments, setPayments] = useState<any>([])
    const [paymentTotalAmount, setPaymentTotalAmount] = useState("0 MMK")
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [printStatus, setPrintStatus] = useState("");

    //input refs
    const customerRef = useRef<any>(null);
    const addressRef = useRef<HTMLInputElement>(null);
    const itemRef = useRef<HTMLInputElement>(null);
    const addRef = useRef<HTMLButtonElement>(null);

    const totalPrice = useMemo(() => {
        let total: number = 0;
        orderItems.forEach((item: IOrderItemDisplay) => { total += (item.selling_price ? parseFloat(item.selling_price.toString()) : 0) })
        return total + parseFloat(order.other_charges);
    }, [orderItems, order.other_charges])

    const getCustomerList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "customer?perPage=-1"
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            let options: ISelect[] = [];
            result.forEach((customer: ICustomer, index: number) => {
                let option: ISelect = { value: customer.customer_id, label: `${customer.customer_name}` }
                options.push(option);
            })
            setCustomerList(options);
        }
    }

    const getProductList = async () => {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}product?perPage=-1`;
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            setProducts(result);

        }
    }

    const handleAddressChange = (address: string) => {
        let currentOrder = { ...order };
        currentOrder.address = address;
        setOrder(currentOrder);
    }

    const handleOtherChargesChange = (charges: string) => {
        let currentOrder = { ...order };
        currentOrder.other_charges = charges;
        setOrder(currentOrder);
    }

    const handleSave = async () => {
        setLoading(true);
        const data = { ...order };
        data.items = orderItems.map((item, index) => { return { product: item.product, quantity: item.quantity, missing_quantity: 0, stock: item.stock, selling_price: item.selling_price, unit: item.unit, productStocks: [], unitHierarchy: [], sortOrder: index } })
        data.payments = [];
        if (fullyPaid) {
            data.payments.push({ amount: (totalPrice).toString(), payment_date: today.toISOString().split('T')[0], payment_channel: '', note: '' })
        } else {
            payments.forEach((payment: any) => {
                data.payments.push({ amount: payment.amount, payment_date: payment.payment_date, payment_channel: payment.payment_channel, note: payment.note })
            })
        }
        if (customer) {
            if (!customer.__isNew__) {
                data.customer = { customer_id: customer.value }
            }
            else {
                data.customer_name = customer?.value
            }
        }
        data.order_date = orderDate;

        console.log(data);
        if (id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "order/" + id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/order?showSuccess=true&action=update&customer=" + customer?.label);
            } else {
                setShowError(true)
                setLoading(false)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "order"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/order?showSuccess=true&action=create&customer=" + customer?.label);
            } else {
                setShowError(true)
                setLoading(false)
            }
        }

    }

    const printTest = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "order/print"
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    // const handlePrint = async () => {
    //     try {
    //         const orderDisplay = {
    //             voucher_code: order.voucher_code,
    //             order_items: orderItems,
    //             total: totalPrice
    //         }
    //         const data = generateReceiptBuffer(orderDisplay);
    //         console.log(data);
    //         setPrintStatus("Searching for printer...");

    //         const device = await navigator.bluetooth.requestDevice({
    //             filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
    //             optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
    //         });

    //         setPrintStatus("Connecting...");
    //         const server = await device.gatt?.connect();

    //         // 2. Get the Primary Service and Characteristic
    //         const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    //         const characteristics = await service?.getCharacteristics();

    //         // Usually, the first characteristic that supports 'write' is the one
    //         const characteristic = characteristics?.find(c => c.properties.write);

    //         if (!characteristic) throw new Error("Print characteristic not found");

    //         setPrintStatus("Sending data...");


    //         // 3. Write data to printer
    //         await characteristic.writeValue(data as BufferSource);

    //         setPrintStatus("Print successful!");
    //         device.gatt?.disconnect();
    //     } catch (error: any) {
    //         console.error(error);
    //         setPrintStatus(`Error: ${error.message}`);
    //     }
    // };

    const handlePrint = async () => {
        const orderDisplay = {
            voucher_code: order.voucher_code,
            order_items: orderItems,
            total: totalPrice
        }
        const data = generateReceiptBuffer(orderDisplay);
        console.log(data);

        try {
            setPrintStatus("Trying USB connection...");
            await printViaUSB(data);
            setPrintStatus("Printed via USB!");
        } catch (usbError) {
            console.warn("USB failed or cancelled, trying Bluetooth...", usbError);

            try {
                setPrintStatus("Trying Bluetooth connection...");
                await printViaBluetooth(data);
                setPrintStatus("Printed via Bluetooth!");
            } catch (btError: any) {
                setPrintStatus(`Printing failed: ${btError.message}`);
            }
        }
    };

    const printViaUSB = async (data: Uint8Array) => {
        // Request a USB device (filters can be empty to show all, or specific to your vendor)
        const device = await navigator.usb.requestDevice({ filters: [] });
        await device.open();

        // Select configuration (usually 1) and claim interface (usually 0)
        await device.selectConfiguration(1);
        await device.claimInterface(0);

        // Find the Bulk Out endpoint (where we send data to the printer)
        const outEndpoint = device.configuration?.interfaces[0].alternates[0].endpoints.find(
            (e: any) => e.direction === 'out' && e.type === 'bulk'
        );

        if (!outEndpoint) throw new Error("USB Bulk Out endpoint not found");

        // Send data (USB doesn't usually need chunking like BLE)
        await device.transferOut(outEndpoint.endpointNumber, data as BufferSource);
        await device.close();
    };

    const printViaBluetooth = async (data: Uint8Array) => {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }]
        });
        const server = await device.gatt?.connect();
        const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
        const characteristics = await service?.getCharacteristics();
        const char = characteristics?.find(c => c.properties.write || c.properties.writeWithoutResponse);

        if (!char) throw new Error("No write characteristic");

        // BLE Chunking (20 bytes at a time)
        const CHUNK_SIZE = 20;
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE);
            await char.writeValueWithoutResponse(chunk);
        }

        device.gatt?.disconnect();
    };


    const handleAddOrUpdateItem = () => {
        const currentOrderItems = [...orderItems]
        const currentItem = { ...item }
        let orderItem = currentOrderItems.find(x => x.item_id == currentItem.item_id);
        if (orderItem) {
            let index = currentOrderItems.indexOf(orderItem);
            currentOrderItems[index] = currentItem;
            setOrderItems(currentOrderItems)
            setItem(initItem(currentOrderItems.length))
        }
        else {
            currentOrderItems.push(currentItem);
            setOrderItems(currentOrderItems);
            setItem(initItem(currentOrderItems.length))
        }
        if (itemRef && itemRef.current) {
            itemRef.current.focus()
        }
    }

    const handleUpdateItem = (item: IOrderItem) => {
        setItem(item)
    }

    const handleEditItem = (id?: string) => {
        const currentItems = [...orderItems];
        const item = currentItems.find(x => x.item_id == id);
        if (item) {
            console.log(item)
            setItem(item)
        }
    }

    const handleDeleteItem = (id?: string) => {
        setOrderItems(prev => prev.filter(x => x.item_id != id))
    }

    const handleAddOrUpdatePayment = () => {
        const currentPayments = [...payments];
        const currentPayment = { ...payment };
        let orderPayment = currentPayments.find(x => x.payment_id != currentPayment.order_payment_id);
        if (orderPayment) {
            let index = currentPayments.indexOf(orderPayment);
            currentPayments[index] = currentPayment;
            setPayments(currentPayments);
            initPayment(currentPayments.length);
        } {
            currentPayments.push(currentPayment);
            setPayments(currentPayments);
            initPayment(currentPayments.length);
        }
    }

    const handleEditPayment = (id?: string) => {
        const currentPayments = [...payments];
        const payment = currentPayments.find(x => x.payment_id == id);
        if (payment) {
            setPayment(payment)
        }
    }


    useEffect(() => {
        if (customerRef && customerRef.current) {
            customerRef.current.focus();
        }
    }, [])


    const handleAddPayment = () => {
        const currentPayments = [...payments];
        let today = new Date();
        currentPayments.push({ payment_id: (currentPayments.length + 1).toString(), amount: 0, payment_date: today.toISOString().split('T')[0] })
        setPayments(currentPayments);
    }

    const handlePaymentChange = (field: 'amount' | 'payment_date' | 'payment_channel' | 'note', value: string) => {
        let prevPayment = { ...payment };
        prevPayment[field] = value;
        setPayment(prevPayment);
    }

    const handleDeletePayment = (payment_id: string) => {
        setPayments((prev: any) => prev.filter((x: any) => x.payment_id != payment_id))
    }

    const calculatePayments = () => {
        const currentPayments = [...payments];
        let totalAmount = 0;
        currentPayments.forEach((payment, index) => {
            totalAmount += parseFloat(payment.amount ? payment.amount : "0");
        })
        setPaymentTotalAmount(formatCurrency(totalAmount));
    }

    useEffect(() => {
        calculatePayments()
    }, [payments])

    const getExistingOrder = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "order"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            const itemPromises = await result.items.map(async (item: any, index: number) => {
                item.item_id = item.order_item_id;
                item.product_name = item.product?.product_name;
                item.stock_name = item.stock?.supplier?.supplier_name + " (" + item.stock?.supplier?.supplier_phone + ")"
                let unitQty = await calculateQuantityWithProduct(item.product?.product_id, [{ unit_id: item.unit?.unit_id, quantity: item.quantity }])
                item.unit_quantity = unitQty?.quantityString
                item.unitHierarchy = unitQty?.unitHierarchy
            })
            await Promise.all(itemPromises);
            setOrder(result);
            setOrderItems(result.items)
            setCustomer({ label: result.customer ? result.customer.customer_name : result.customer_name, value: result.customer ? result.customer.customer_id : result.customer_name })
            setOrderDate(result.order_date)
            setPayments(result.payments)

        }
    }

    useEffect(() => {
        getCustomerList()
        getProductList()
        if (id) {

            getExistingOrder(id);
        }
    }, [])


    const paymentTotal = payments.reduce((prev: any, current: any) => prev + parseFloat(current.amount), 0)

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px', overflowY: 'auto', height: '95vh', width: '100%' }}>
            <Alert severity="error" hidden={!showError}>{`Failed to create Voucher.`}</Alert>
            <br />


            <Grid container columnSpacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body1" fontWeight={'bold'}>Add Order</Typography>
                    <Grid container columnSpacing={4} sx={{ paddingBottom: '20px' }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <div className="pt-[20px]">
                                <Creatable options={customerList} placeholder='Customers' styles={{
                                    control: (styles) => ({ ...styles, width: '100%', height: '60px' }),
                                    menu: (styles) => ({ ...styles, width: '100%' }),
                                    menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                                }}
                                    isMulti={false}
                                    value={customer}
                                    onChange={(option) => { setCustomer(option) }}
                                    onKeyDown={(e) => { handleNextFocus(e, addressRef) }}
                                    ref={customerRef}
                                />
                            </div>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <div className="pt-[20px]">
                                <div className='w-[100%] border-[#CCCCCC] border-[1px] h-[55px] rounded-[7px] justify-center flex items-center'>
                                    {/* <label className='text-[#777777]'>Order Date - &nbsp; &nbsp;</label> */}
                                    <input type='date' value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
                                </div>
                            </div>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <div className="pt-[20px]">
                                <TextField inputRef={addressRef} type="text" InputLabelProps={{ shrink: !!order.address }} value={order.address} variant="outlined" label="Address" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} onChange={(e) => handleAddressChange(e.target.value)} onKeyDown={(e) => { handleNextFocus(e, itemRef) }} />
                            </div>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <div className="pt-[20px]">
                                <TextField type="number" InputLabelProps={{ shrink: !!order.other_charges }} value={order.other_charges} variant="outlined" label="Other Charges" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} onChange={(e) => handleOtherChargesChange(e.target.value)} />
                            </div>
                        </Grid>

                    </Grid>
                    <Divider />
                    <div className="pt-[20px]">
                        <Typography variant="body1" fontWeight={'bold'}>Item</Typography>
                        <OrderItem item={item} products={products} updateItem={handleUpdateItem} itemRef={itemRef} nextRef={addRef} />
                        <div className="flex justify-start pt-[20px] gap-4">
                            {orderItems.map((item) => item.item_id).includes(item.item_id) ? <Button variant="outlined" color="warning" onClick={() => setItem(initItem(orderItems.length))}>Cancel</Button> : <></>}
                            <Button ref={addRef} variant="contained" color="primary" onClick={() => handleAddOrUpdateItem()}>{orderItems.map((item) => item.item_id).includes(item.item_id) ? 'Update' : 'Add'}</Button>
                        </div>
                    </div>
                    <div className="pt-[40px]"><label className="text-[16px] font-bold">Payments</label></div>
                    <div className="flex gap-3 items-center">
                        <Switch defaultChecked={fullyPaid} value={fullyPaid} onChange={() => setFullyPaid(prev => !prev)} />
                        <Typography variant="body1" fontWeight={''}>Fully Paid</Typography>
                    </div>

                    {

                        !fullyPaid ?
                            <></>
                            // <div className="pt-[20px]">
                            //     <Grid container columnSpacing={4} sx={{ paddingBottom: '20px' }}>
                            //         <Grid size={{ xs: 12, sm: 6 }}>
                            //             <div className="pt-[20px]">
                            //                 <TextField variant="outlined" placeholder="Amount" value={payment.amount} sx={{ width: { xs: '100%', lg: '50%' } }} onChange={(e) => handlePaymentChange("amount", e.target.value)} />
                            //             </div>
                            //         </Grid>
                            //         <Grid size={{ xs: 12, sm: 6 }}>
                            //             <div className="pt-[20px]">
                            //                 <input type='date' value={payment.payment_date} onChange={(e) => handlePaymentChange("payment_date", e.target.value)} />
                            //             </div>
                            //         </Grid>
                            //         <Grid size={{ xs: 12, sm: 6 }}>
                            //             <div className="pt-[20px]">
                            //                 <TextField variant="outlined" placeholder="Channel" value={payment.payment_channel} sx={{ width: { xs: '100%', lg: '50%' } }} onChange={(e) => handlePaymentChange("payment_channel", e.target.value)} />
                            //             </div>
                            //         </Grid>
                            //         <Grid size={{ xs: 12, sm: 6 }}>
                            //             <div className="pt-[20px]">
                            //                 <TextField variant="outlined" placeholder="Note" value={payment.note} sx={{ width: { xs: '100%', lg: '50%' } }} onChange={(e) => handlePaymentChange("note", e.target.value)} />
                            //             </div>
                            //         </Grid>
                            //     </Grid>
                            //     <div className="flex justify-start pt-[20px] gap-4">
                            //         {payments.map((payment: any) => payment.order_payment_id).includes(payment.order_payment_id) ? <Button variant="outlined" color="warning" onClick={() => setPayment(initPayment(payments.length))}>Cancel</Button> : <></>}
                            //         <Button ref={addRef} variant="contained" color="primary" onClick={() => handleAddOrUpdatePayment()}>{payments.map((payment: any) => payment.order_payment_id).includes(payment.order_payment_id) ? 'Update' : 'Add'}</Button>
                            //     </div>
                            //     <div className="p-[20px]">
                            //         {/* <TableContainer> */}

                            //         {/* <Table>
                            //             <TableHead>
                            //                 <TableRow>
                            //                     <TableCell style={{ width: '400px', minWidth: '200px' }}>Amount</TableCell>
                            //                     <TableCell style={{ width: '400px', minWidth: '200px' }}>Payment Date</TableCell>
                            //                     <TableCell style={{ width: '400px', minWidth: '200px' }}>Payment Channel</TableCell>
                            //                     <TableCell style={{ width: '400px', minWidth: '200px' }}>Note</TableCell>
                            //                     <TableCell align="right"><Button variant="outlined" color="primary" onClick={() => handleAddPayment()}><AddIcon /></Button></TableCell>
                            //                 </TableRow>
                            //             </TableHead>
                            //             <TableBody>
                            //                 {
                            //                     payments.map((payment: any, index: number) =>
                            //                         <TableRow key={index}>
                            //                             <TableCell style={{ width: '400px', minWidth: '200px' }}>
                            //                                 <TextField variant="outlined" value={payment.amount} sx={{ width: { xs: '100%', lg: '50%' } }} onChange={(e) => handlePaymentChange("amount", e.target.value, payment.payment_id)} />
                            //                             </TableCell>
                            //                             <TableCell style={{ width: '400px', minWidth: '200px' }}>
                            //                                 <input type='date' value={payment.payment_date} onChange={(e) => handlePaymentChange("payment_date", e.target.value, payment.payment_id)} />
                            //                             </TableCell>
                            //                             <TableCell style={{ width: '400px', minWidth: '200px' }}>
                            //                                 <TextField variant="outlined" value={payment.payment_channel} sx={{ width: { xs: '100%', lg: '50%' } }} onChange={(e) => handlePaymentChange("payment_channel", e.target.value, payment.payment_id)} />
                            //                             </TableCell>
                            //                             <TableCell style={{ width: '400px', minWidth: '200px' }}>
                            //                                 <TextField variant="outlined" value={payment.note} sx={{ width: { xs: '100%', lg: '50%' } }} onChange={(e) => handlePaymentChange("note", e.target.value, payment.payment_id)} />
                            //                             </TableCell>
                            //                             <TableCell align="right"><Button variant="outlined" color="warning" onClick={() => handleDeletePayment(payment.payment_id)}><DeleteIcon /></Button></TableCell>
                            //                         </TableRow>
                            //                     )
                            //                 }
                            //             </TableBody>
                            //         </Table> */}
                            //         {/* </TableContainer> */}

                            //     </div>
                            // </div>
                            : <></>
                    }


                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>

                    <div className="p-[20px] bg-[#E5E4E2] rounded-[10px] h-[75vh] overflow-y-auto">
                        <Typography variant="body1" fontWeight={'bold'}>Order Items</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ maxWidth: '100px' }}>Product</TableCell>
                                    {/* <TableCell style={{ maxWidth: '100px' }}>Stock</TableCell> */}
                                    <TableCell style={{ maxWidth: '100px' }}>Quantity</TableCell>
                                    <TableCell style={{ maxWidth: '100px' }}>Price</TableCell>
                                    <TableCell style={{ maxWidth: '100px' }}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    orderItems.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((item: IOrderItemDisplay, index: number) =>
                                        <OrderItemDisplay key={item.item_id} item_id={item.item_id} product_name={item.product_name} stock_name={item.stock_name} unit_quantity={item.unit_quantity} selling_price={formatCurrency(item.selling_price ? item.selling_price : 0)} handleEdit={handleEditItem} handleDelete={handleDeleteItem} />
                                    )
                                }
                                {
                                    orderItems.length > 0 ?
                                        <>
                                            <TableRow>
                                                <TableCell colSpan={2}></TableCell>
                                                <TableCell><Typography variant="body2" fontWeight={'bold'}>Total Amount</Typography></TableCell>
                                                <TableCell><Typography variant="body2" fontWeight={'bold'}>{formatCurrency(totalPrice)}</Typography></TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                            {
                                                fullyPaid ?
                                                    <>
                                                        <TableRow>
                                                            <TableCell colSpan={2}></TableCell>
                                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>Total Paid</Typography></TableCell>
                                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>{formatCurrency(totalPrice)}</Typography></TableCell>
                                                            <TableCell></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell colSpan={2}></TableCell>
                                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>Unpaid</Typography></TableCell>
                                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>{formatCurrency(0)}</Typography></TableCell>
                                                            <TableCell></TableCell>
                                                        </TableRow>
                                                    </>

                                                    :
                                                    <>
                                                        {
                                                            payments.map((payment: any, index: number) =>
                                                                <TableRow>
                                                                    <TableCell colSpan={2}></TableCell>
                                                                    <TableCell><Typography variant="body2" fontWeight={'bold'}>{payment.payment_date}</Typography></TableCell>
                                                                    <TableCell><Typography variant="body2" fontWeight={'bold'}>{formatCurrency(payment.amount)}</Typography></TableCell>
                                                                    <TableCell></TableCell>
                                                                </TableRow>
                                                            )

                                                        }
                                                        <TableRow>
                                                            <TableCell colSpan={2}></TableCell>
                                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>Total Paid</Typography></TableCell>
                                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>{formatCurrency(paymentTotal)}</Typography></TableCell>
                                                            <TableCell></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell colSpan={2}></TableCell>
                                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>Unpaid</Typography></TableCell>
                                                            <TableCell><Typography variant="body2" fontWeight={'bold'}>{formatCurrency(totalPrice - paymentTotal)}</Typography></TableCell>
                                                            <TableCell></TableCell>
                                                        </TableRow>
                                                    </>
                                            }
                                        </>
                                        : <></>
                                }

                            </TableBody>
                        </Table>
                    </div>
                </Grid>
            </Grid>


            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/order'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button disabled={loading} variant="contained" color={loading ? "secondary" : "primary"} onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
                <Button onClick={() => handlePrint()}>{'Print'}</Button>
            </div>

        </Box>
    )
}
export default AddOrder;