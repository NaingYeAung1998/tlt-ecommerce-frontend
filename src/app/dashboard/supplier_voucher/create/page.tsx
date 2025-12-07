"use client"

import { Alert, Box, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ISupplierVoucher } from "../interfaces/supplier_voucher.interface";
import Select from 'react-select'
import { ISupplier } from "../../supplier/interfaces/supplier.interface";
import { ISelect } from "@/app/interfaces";
import { IStockList } from "../../stock/interfaces/stock.interface";
import { Add as AddIcon, Delete as DeleteIcon, PlusOne } from "@mui/icons-material";
import { calculateLowestUnitQuantity, calculateQuantityWithProduct, calculateRoundUpUnit, formatCurrency } from "@/app/utils";
import { IUnitList } from "../../unit/interfaces/unit.interface";

function AddSupplierVoucher() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [supplierVoucher, setSupplierVoucher] = useState<ISupplierVoucher>({} as ISupplierVoucher)
    const [supplierList, setSupplierList] = useState<ISelect[]>([])
    const [supplier, setSupplier] = useState<ISelect | null>(null)
    const [stockList, setStockList] = useState<ISelect[]>([])
    const [stocks, setStocks] = useState<any>([]);
    const [selectedStocks, setSelectedStocks] = useState<any>([])
    const [stockTotalAmount, setStockTotalAmount] = useState("0 MMK")
    const [payments, setPayments] = useState<any>([])
    const [paymentTotalAmount, setPaymentTotalAmount] = useState("0 MMK")
    const [showError, setShowError] = useState(false);

    const getSupplierList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "supplier?perPage=-1"
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            let options: ISelect[] = [];
            result.forEach((supplier: ISupplier, index: number) => {
                let option: ISelect = { value: supplier.supplier_id, label: `${supplier.supplier_name} (${supplier.supplier_phone}) (${supplier.note})` }
                options.push(option);
            })
            setSupplierList(options);
        }
    }

    const handleSave = async () => {
        const data = { ...supplierVoucher };
        data.supplier = { supplier_id: supplier?.value }
        data.stocks = [];
        data.payments = [];
        selectedStocks.forEach((stock: any) => {
            data.stocks.push({ stock: { stock_id: stock.stock_id } })
        })
        payments.forEach((payment: any) => {
            data.payments.push({ amount: payment.amount, payment_date: payment.payment_date, payment_channel: payment.payment_channel, note: payment.note })
        })
        console.log(data);
        if (id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "supplier_voucher/" + id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/supplier_voucher?showSuccess=true&action=update&supplier=" + supplier?.label);
            } else {
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "supplier_voucher"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/supplier_voucher?showSuccess=true&action=create&supplier=" + supplier?.label);
            } else {
                setShowError(true)
            }
        }

    }


    const handleAddStock = () => {
        const currentStocks = [...selectedStocks];
        currentStocks.push({ stock_id: (currentStocks.length + 1).toString() });
        setSelectedStocks(currentStocks)
    }

    const handleStockChange = async (option: any, stock_id: string) => {
        let currentStocks = [...selectedStocks];
        const stock = stocks.find((x: any) => x.stock_id == option.value);
        if (stock) {
            const currentStock = currentStocks.find((x: any) => x.stock_id == stock_id)
            if (currentStock) {
                const formattedQunatity = await calculateQuantityWithProduct(stock.stock_product_id, [{ unit_id: stock.stock_unit_id, unit_name: stock.stock_unit, quantity: stock.quantity }])
                stock.quantity = formattedQunatity?.quantityString;
                const index = currentStocks.indexOf(currentStock);
                currentStocks[index] = stock;
                currentStocks[index].option = { value: stock.stock_id, label: `${stock.stock_code} (${stock.stock_product})` }
                setSelectedStocks(currentStocks);
            }
        }
    }

    const handleStockDelete = (stock_id: string) => {
        setSelectedStocks((prev: any) => prev.filter((x: any) => x.stock_id != stock_id))
    }

    const calculateStocks = () => {
        const currentStocks = [...selectedStocks];
        let totalAmount = 0;
        currentStocks.forEach((stock, index) => {
            totalAmount += parseFloat(stock.buying_price ? stock.buying_price : "0");
        })
        setStockTotalAmount(formatCurrency(totalAmount));
    }

    const filterStockList = () => {
        setStockList(prev => prev.filter(x => { return selectedStocks.every((y: any) => y.stock_id != x.value) }))
    }

    useEffect(() => {
        calculateStocks()
        filterStockList()
    }, [selectedStocks])


    const handleAddPayment = () => {
        const currentPayments = [...payments];
        let today = new Date();
        currentPayments.push({ payment_id: (currentPayments.length + 1).toString(), amount: 0, payment_date: today.toISOString().split('T')[0] })
        setPayments(currentPayments);
    }

    const handlePaymentChange = (field: string, value: string, payment_id: string) => {
        let currentPayments = [...payments];
        let payment = currentPayments.find(x => x.payment_id == payment_id);
        if (payment) {
            const index = currentPayments.indexOf(payment);
            currentPayments[index][field] = value;
            setPayments(currentPayments)
        }
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

    useEffect(() => {
        getStockListBySupplier();
        // setStockList([]);
        // setSelectedStocks([]);
    }, [supplier])


    const getStockListBySupplier = async () => {
        if (supplier) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock/getBySupplier?supplier_id=" + supplier.value
            let response = await fetch(url);
            if (response.ok) {
                let result = await response.json();
                setStocks(result)
                let options: ISelect[] = [];
                result.forEach((stock: IStockList, index: number) => {
                    let option: ISelect = { value: stock.stock_id, label: `${stock.stock_code} (${stock.stock_product})` }
                    options.push(option);
                })
                setStockList(options);
            }
        }

    }

    const getExistingSupplierVoucher = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "supplier_voucher"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            console.log(result)
            let currentStocks: any = [];
            result.stocks.forEach(async (stock: any) => {
                if (stock.stock) {
                    const formattedQunatity = await calculateQuantityWithProduct(stock.stock.product?.product_id, [{ unit_id: stock.stock.unit?.unit_id, unit_name: stock.stock.unit?.unit_name, quantity: stock.stock.quantity }])
                    stock.stock.quantity = formattedQunatity?.quantityString;
                    stock.stock.option = { value: stock.stock.stock_id, label: `${stock.stock.stock_code} (${stock.stock.product?.product_name}(${stock.stock.product?.product_code}))` }
                    stock.stock.buying_price_formatted = formatCurrency(stock.stock.buying_price)
                    stock.stock.stock_unit = stock.stock.unit?.unit_name;
                }
                currentStocks.push(stock.stock)
            })
            let supplier = result.supplier;
            setSupplier({ value: supplier.supplier_id, label: `${supplier.supplier_name} (${supplier.supplier_phone}) (${supplier.note})` })
            setSelectedStocks(currentStocks)
            setPayments(result.payments)

        }
    }

    useEffect(() => {
        getSupplierList()
        if (id) {

            getExistingSupplierVoucher(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px', overflowY: 'auto', height: '95vh', width: '100%' }}>
            <Alert severity="error" hidden={!showError}>{`Failed to create Voucher.`}</Alert>
            <br />

            <Typography variant="body1" fontWeight={'bold'}>Add Supplier Voucher</Typography>
            <div className="pt-[20px]">
                <Select options={supplierList} placeholder='Suppliers' styles={{
                    control: (styles) => ({ ...styles, width: '50%', height: '60px' }),
                    menu: (styles) => ({ ...styles, width: '50%' }),
                    menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '50%' })
                }}
                    value={supplier}
                    onChange={(option) => setSupplier(option)}
                />
            </div>

            <div className="pt-[40px]">
                <div className="flex">
                    <div><label className="text-[16px] font-bold">Stocks (Total - {stockTotalAmount})</label></div>
                </div>
                <div className="p-[20px]">
                    {/* <TableContainer> */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ width: '400px', minWidth: '200px' }}>Stock</TableCell>
                                <TableCell style={{ width: '400px', minWidth: '200px' }}>Buying Price</TableCell>
                                <TableCell style={{ width: '400px', minWidth: '200px' }}>Quantity</TableCell>
                                <TableCell align="right"><Button variant="outlined" color="primary" onClick={() => handleAddStock()}><AddIcon /></Button></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                selectedStocks.map((stock: any, index: number) =>
                                    <TableRow key={index}>
                                        <TableCell style={{ width: '400px' }}>
                                            <Select options={stockList} placeholder='Stocks' styles={{
                                                control: (styles) => ({ ...styles, width: '100%', height: '60px' }),
                                                menu: (styles) => ({ ...styles, width: '100%' }),
                                                menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '50%' })
                                            }}
                                                value={stock.option}
                                                onChange={(option) => handleStockChange(option, stock.stock_id)}
                                            />
                                        </TableCell>
                                        <TableCell style={{ width: '400px' }}>{stock.buying_price_formatted}</TableCell>
                                        <TableCell style={{ width: '400px' }}>{`${stock.quantity ? stock.quantity : ""}`}</TableCell>
                                        <TableCell align="right"><Button variant="outlined" color="warning" onClick={() => handleStockDelete(stock.stock_id)}><DeleteIcon /></Button></TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                    {/* </TableContainer> */}


                </div>
            </div>

            <div className="pt-[40px]">
                <div className="flex">
                    <div><label className="text-[16px] font-bold">Payments (Total - {paymentTotalAmount})</label></div>
                </div>
                <div className="p-[20px]">
                    {/* <TableContainer> */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ width: '400px', minWidth: '200px' }}>Amount</TableCell>
                                <TableCell style={{ width: '400px', minWidth: '200px' }}>Payment Date</TableCell>
                                <TableCell style={{ width: '400px', minWidth: '200px' }}>Payment Channel</TableCell>
                                <TableCell style={{ width: '400px', minWidth: '200px' }}>Note</TableCell>
                                <TableCell align="right"><Button variant="outlined" color="primary" onClick={() => handleAddPayment()}><AddIcon /></Button></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                payments.map((payment: any, index: number) =>
                                    <TableRow key={index}>
                                        <TableCell style={{ width: '400px', minWidth: '200px' }}>
                                            <TextField variant="outlined" value={payment.amount} sx={{ width: { xs: '100%', lg: '50%' } }} onChange={(e) => handlePaymentChange("amount", e.target.value, payment.payment_id)} />
                                        </TableCell>
                                        <TableCell style={{ width: '400px', minWidth: '200px' }}>
                                            <input type='date' value={payment.payment_date} onChange={(e) => handlePaymentChange("payment_date", e.target.value, payment.payment_id)} />
                                        </TableCell>
                                        <TableCell style={{ width: '400px', minWidth: '200px' }}>
                                            <TextField variant="outlined" value={payment.payment_channel} sx={{ width: { xs: '100%', lg: '50%' } }} onChange={(e) => handlePaymentChange("payment_channel", e.target.value, payment.payment_id)} />
                                        </TableCell>
                                        <TableCell style={{ width: '400px', minWidth: '200px' }}>
                                            <TextField variant="outlined" value={payment.note} sx={{ width: { xs: '100%', lg: '50%' } }} onChange={(e) => handlePaymentChange("note", e.target.value, payment.payment_id)} />
                                        </TableCell>
                                        <TableCell align="right"><Button variant="outlined" color="warning" onClick={() => handleDeletePayment(payment.payment_id)}><DeleteIcon /></Button></TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                    {/* </TableContainer> */}

                </div>
            </div>

            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/supplier_voucher'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>

        </Box>
    )
}
export default AddSupplierVoucher;