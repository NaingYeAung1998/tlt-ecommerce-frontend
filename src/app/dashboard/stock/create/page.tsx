"use client"

import { Alert, Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Select from 'react-select'
import { ISelect } from "@/app/interfaces";
import { ICategory } from "../../category/interfaces/category.interface";
import { IGrade } from "../../grade/interfaces/grade.interface";
import { IStock } from "../interfaces/stock.interface";
import { IProduct, IProductList } from "../../product/interfaces/product.interface";
import { ISupplier } from "../../supplier/interfaces/supplier.interface";
import { IUnit } from "../../unit/interfaces/unit.interface";

function AddStock() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [stock, setStock] = useState<IStock>({} as IStock)
    const [productList, setProductList] = useState<ISelect[]>([]);
    const [supplierList, setSupplierList] = useState<ISelect[]>([]);
    const [unitList, setUnitList] = useState<ISelect[]>([]);
    const [product, setProduct] = useState<ISelect | null>(null);
    const [supplier, setSupplier] = useState<ISelect | null>(null);
    const [unit, setUnit] = useState<ISelect | null>(null);
    const [showError, setShowError] = useState(false);
    const product_id = searchParams.get('product_id');

    const handleInputChange = (field: 'stock_code' | 'quantity' | 'buying_price' | 'selling_price' | 'fix_price' | 'note', value: string) => {
        setStock({ ...stock, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...stock };
        data.product = { product_id: '' };
        data.supplier = { supplier_id: '' };
        data.unit = { unit_id: '' };
        data.product.product_id = product ? product.value : '';
        data.supplier.supplier_id = supplier ? supplier.value : '';
        data.unit.unit_id = unit ? unit.value : '';

        if (id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock/" + id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/stock?showSuccess=true&action=update&stock=" + stock.stock_code);
            } else {
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/stock?showSuccess=true&action=create&stock=" + stock.stock_code);
            } else {
                setShowError(true)
            }
        }

    }

    const getProductList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "product?perPage=-1"
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            let options: ISelect[] = [];
            result.forEach((product: IProductList, index: number) => {
                let option: ISelect = { value: product.product_id, label: product.product_name + " (" + product.product_code + ")" }
                options.push(option);
            })
            setProductList(options);
            if (product_id) {
                let selectedProduct = options.find(x => x.value == product_id);
                if (selectedProduct) {
                    setProduct(selectedProduct);
                }
            }
        }
    }

    const getSupplierList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "supplier?perPage=-1"
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            let options: ISelect[] = [];
            result.forEach((supplier: ISupplier, index: number) => {
                let option: ISelect = { value: supplier.supplier_id, label: supplier.supplier_name }
                options.push(option);
            })
            setSupplierList(options);
        }
    }

    const getUnitList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "unit?perPage=-1"
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            let options: ISelect[] = [];
            result.forEach((unit: IUnit, index: number) => {
                let option: ISelect = { value: unit.unit_id, label: unit.unit_symbol }
                options.push(option);
            })
            setUnitList(options);
        }
    }

    const getExistingStock = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            setStock(result);
            setProduct({ value: result.product?.product_id, label: result.product?.product_name + " (" + result.product?.product_code + ")" });
            setSupplier({ value: result.supplier?.supplier_id, label: result.supplier?.supplier_name });
            setUnit({ value: result.unit?.unit_id, label: result.unit?.unit_name })
        }
    }

    useEffect(() => {
        getProductList();
        getSupplierList();
        getUnitList()

        if (id) {
            getExistingStock(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px' }}>
            <Alert severity="error" hidden={!showError}>{`Failed to create stock.`}</Alert>
            <br />

            <Typography variant="body1" fontWeight={'bold'}>Add Stock</Typography>

            <Grid container columnSpacing={4}>
                <Grid size={6}>
                    <div className="pt-[20px]">
                        <TextField InputLabelProps={{ shrink: !!stock.stock_code }} value={stock.stock_code} onChange={(e) => { handleInputChange("stock_code", e.target.value) }} variant="outlined" label="Code" sx={{ width: { xs: '100%', lg: '100%' } }} />
                    </div>
                </Grid>
                <Grid size={6}>
                    <div className="pt-[20px]">
                        <Select options={productList} placeholder='Products' styles={{
                            control: (styles) => ({ ...styles, width: '100%', height: '55px' }),
                            menu: (styles) => ({ ...styles, width: '100%' }),
                            menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                        }}
                            value={product}
                            onChange={(option) => setProduct(option)}
                        />
                    </div>
                </Grid>
                <Grid size={6}>
                    <div className="pt-[20px]">
                        <Select options={supplierList} placeholder='Suppliers' styles={{
                            control: (styles) => ({ ...styles, width: '100%', height: '55px' }),
                            menu: (styles) => ({ ...styles, width: '100%' }),
                            menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                        }}
                            value={supplier}
                            onChange={(option) => setSupplier(option)}
                        />
                    </div>
                </Grid>
                <Grid size={6}>
                    <div className="pt-[20px]">
                        <Select options={unitList} placeholder='Units' styles={{
                            control: (styles) => ({ ...styles, width: '100%', height: '55px' }),
                            menu: (styles) => ({ ...styles, width: '100%' }),
                            menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                        }}
                            value={unit}
                            onChange={(option) => setUnit(option)}
                        />
                    </div>
                </Grid>
                <Grid size={6}>
                    <div className="pt-[20px]">
                        <TextField type="number" InputLabelProps={{ shrink: !!stock.quantity }} value={stock.quantity} onChange={(e) => { handleInputChange("quantity", e.target.value) }} variant="outlined" label="Quantity" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                    </div>
                </Grid>
                <Grid size={6}>
                    <div className="pt-[20px]">
                        <TextField type="number" InputLabelProps={{ shrink: !!stock.buying_price }} value={stock.buying_price} onChange={(e) => { handleInputChange("buying_price", e.target.value) }} variant="outlined" label="Buying Price" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                    </div>
                </Grid>
                <Grid size={6}>
                    <div className="pt-[20px]">
                        <TextField type="number" InputLabelProps={{ shrink: !!stock.selling_price }} value={stock.selling_price} onChange={(e) => { handleInputChange("selling_price", e.target.value) }} variant="outlined" label="Selling Price" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                    </div>
                </Grid>
                <Grid size={6}>
                    <div className="pt-[20px]">
                        <TextField type="number" InputLabelProps={{ shrink: !!stock.fix_price }} value={stock.fix_price} onChange={(e) => { handleInputChange("fix_price", e.target.value) }} variant="outlined" label="Fixed Price" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                    </div>
                </Grid>
                <Grid size={6}>
                    <div className="pt-[20px]">
                        <TextField InputLabelProps={{ shrink: !!stock.note }} value={stock.note} onChange={(e) => { handleInputChange("note", e.target.value) }} variant="outlined" label="Note" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                    </div>
                </Grid>
            </Grid>

            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/product'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>

        </Box>
    )
}
export default AddStock;