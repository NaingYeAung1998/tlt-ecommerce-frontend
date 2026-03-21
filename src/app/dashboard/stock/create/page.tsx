"use client"

import { Alert, Box, Button, Grid, Modal, Switch, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Select from 'react-select'
import { ISelect } from "@/app/interfaces";
import { ICategory } from "../../category/interfaces/category.interface";
import { IGrade } from "../../grade/interfaces/grade.interface";
import { IStock, IStockTrack } from "../interfaces/stock.interface";
import { IProduct, IProductList } from "../../product/interfaces/product.interface";
import { ISupplier } from "../../supplier/interfaces/supplier.interface";
import { IUnit, IUnitList } from "../../unit/interfaces/unit.interface";
import { IWarehouse } from "../../warehouse/intefaces/warehouse.interfaces";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { calculateLowestUnitQuantity, calculateQuantityWithHierarchy, calculateQuantityWithProduct, calculateRoundUpUnit, getUnitHierarchyByProduct } from "@/app/utils";
import { Divider } from "@/app/components/divider";
import { ITrack } from "../interfaces/track.interface";
import { TRACK_STATUS_LIST } from "@/app/constants";

function AddStock() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [stock, setStock] = useState<IStock>({} as IStock)
    const [productList, setProductList] = useState<ISelect[]>([]);
    const [supplierList, setSupplierList] = useState<ISelect[]>([]);
    const [unitList, setUnitList] = useState<ISelect[]>([]);
    const [unitHierarchy, setUnitHierarchy] = useState<IUnitList[]>([]);
    const [warehouseList, setWarehouseList] = useState<ISelect[]>([]);
    const [product, setProduct] = useState<ISelect | null>(null);
    const [supplier, setSupplier] = useState<ISelect | null>(null);
    const [wholesaleUnit, setWholesaleUnit] = useState<ISelect | null>(null);
    const [quantityList, setQuantityList] = useState<any>([]);
    const [roundupQuantity, setRoundupQuantity] = useState("");
    const [editQuantityModalOpen, setEditQuantityModalOpen] = useState(false);
    const [warehouse, setWarehouse] = useState<ISelect | null>(null);
    const [fullyStored, setFullyStored] = useState(true);
    const [showError, setShowError] = useState(false);
    const product_id = searchParams.get('product_id');

    const handleInputChange = (field: 'buying_price' | 'selling_price' | 'wholesale_selling_price' | 'wholesale_fix_price' | 'wholesale_starting_quantity' | 'fix_price' | 'note', value: string) => {
        setStock({ ...stock, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...stock };
        data.product = { product_id: product ? product.value : '' };
        data.supplier = { supplier_id: supplier ? supplier.value : '' };
        data.warehouse = { warehouse_id: warehouse ? warehouse.value : '' }
        let wholesaleLowestUnitQty = calculateLowestUnitQuantity(unitHierarchy, [{ unit_id: wholesaleUnit?.value, unit_name: wholesaleUnit?.label, quantity: data.wholesale_starting_quantity }]);
        data.wholesale_starting_quantity = wholesaleLowestUnitQty.quantity?.toString();
        data.wholesale_starting_unit = { unit_id: wholesaleLowestUnitQty.unit_id };
        if (fullyStored) {
            data.stock_tracks = [];
            const today = new Date();
            let track: IStockTrack = {
                checked_date: today.toISOString().split('T')[0],
                quantity: data.quantity,
                unit: data.unit,
                status: TRACK_STATUS_LIST.find(x => x.label == 'Stored')?.value || '',
                warehouse: data.warehouse,
            }
            data.stock_tracks.push(track);
        }
        console.log(data)

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
                router.push("/dashboard/stock?showSuccess=true&action=update&stock=" + product?.label + (product_id != null && product_id != "null" ? ("&product_id=" + product_id) : ""));
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
                router.push("/dashboard/stock?showSuccess=true&action=create&stock=" + product?.label + (product_id != null && product_id != "null" ? ("&product_id=" + product_id) : ""));
            } else {
                setShowError(true)
            }
        }

    }

    const getProductList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "product?search=&perPage=-1"
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

    // const getUnitList = async () => {
    //     const url = process.env.NEXT_PUBLIC_BACKEND_URL + "unit?perPage=-1"
    //     let response = await fetch(url);
    //     if (response.ok) {
    //         let result = await response.json();
    //         let options: ISelect[] = [];
    //         result.forEach((unit: IUnit, index: number) => {
    //             let option: ISelect = { value: unit.unit_id, label: unit.unit_name }
    //             options.push(option);
    //         })
    //         setUnitList(options);
    //     }
    // }

    const getProductUnitHierarchy = async (product_id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "product/getProductUnitHierarchy/" + product_id
        let response = await fetch(url);
        if (response.ok) {
            let result: IUnitList[] = await response.json();
            setUnitHierarchy(result);
            let options: ISelect[] = [];
            result.forEach((unit: IUnit, index: number) => {
                let option: ISelect = { value: unit.unit_id, label: unit.unit_name }
                options.push(option);
            })
            setUnitList(options);
        }
    }

    const getWarehouseList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "warehouse?perPage=-1"
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            let options: ISelect[] = [];
            result.forEach((warehouse: IWarehouse, index: number) => {
                let option: ISelect = { value: warehouse.warehouse_id, label: warehouse.warehouse_name }
                options.push(option);
            })
            setWarehouseList(options);
        }
    }

    const getExistingStock = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();

            setProduct({ value: result.stock_product_id, label: result.stock_product });
            setSupplier({ value: result.stock_supplier_id, label: result.stock_supplier });
            setWarehouse({ value: result.stock_warehouse_id, label: result.stock_warehouse })
            const unitHierarchy = await getUnitHierarchyByProduct(product_id ?? '');
            if (unitHierarchy) {
                let formattedQuantity = calculateQuantityWithHierarchy(unitHierarchy, [{ unit_id: result.stock_unit_id, unit_name: result.stock_unit, quantity: result.quantity }]);
                setRoundupQuantity(formattedQuantity.quantityString);
                let qtyList: any[] = [];
                formattedQuantity.quantityList?.forEach((qty, index) => {
                    qtyList.push({ id: (index + 1).toString(), quantity: qty.quantity, unit_id: qty.unit_id, unit_name: qty.unit_name, unit: { value: qty.unit_id, label: qty.unit_name } })
                })
                setQuantityList(qtyList)

                let formmatedWholesaleStartingQuantity = calculateQuantityWithHierarchy(unitHierarchy, [{ unit_id: result.wholesale_strating_unit_id, unit_name: result.wholesale_strating_unit, quantity: result.wholesale_starting_quantity }]);
                // wholesale quantity list should always return only one value
                if (formmatedWholesaleStartingQuantity.quantityList[0]) {
                    setWholesaleUnit({ label: formmatedWholesaleStartingQuantity.quantityList[0].unit_name, value: formmatedWholesaleStartingQuantity.quantityList[0].unit_id })
                    result.wholesale_starting_quantity = formmatedWholesaleStartingQuantity.quantityList[0].quantity;
                }
            }


            setStock(result);
        }
    }

    const calculateUnitsQuanttiy = () => {
        let lowestQty = calculateLowestUnitQuantity(unitHierarchy, quantityList)

        let currentStock = { ...stock };
        currentStock.quantity = lowestQty.quantity.toString();
        currentStock.unit = { unit_id: lowestQty.unit_id }
        setStock(currentStock);
        let roundupQuantityString = "";
        let roundupQuantityList: any[] = [];
        let roundupQuantity = calculateRoundUpUnit(unitHierarchy, lowestQty.quantity);

        roundupQuantity.forEach((qty, index) => {
            roundupQuantityString += `${qty.quantity} ${qty.unit_name} `;
            roundupQuantityList.push({ id: (index + 1).toString(), quantity: qty.quantity, unit_id: qty.unit_id, unit_name: qty.unit_name, unit: { value: qty.unit_id, label: qty.unit_name } })
        })

        setRoundupQuantity(roundupQuantityString);
        setQuantityList(roundupQuantityList);
    }

    const handleEditQuantityModalClose = () => {
        setEditQuantityModalOpen(false);
    }

    const handleQuantityChange = (quantity: any, id: string) => {
        let qtyList = [...quantityList];
        let qty = qtyList.find(x => x.id == id);
        if (qty) {
            let index = qtyList.indexOf(qty);
            qtyList[index].quantity = quantity;
            setQuantityList(qtyList)
        }
    }

    const handleQuantityUnitChange = (option: any, id: string) => {
        let qtyList = [...quantityList];
        let qty = qtyList.find(x => x.id == id);
        if (qty) {
            let index = qtyList.indexOf(qty);
            qtyList[index].unit_id = option.value;
            qtyList[index].unit_name = option.label;
            qtyList[index].unit = option
            setQuantityList(qtyList);
        }
    }

    const handleAddQuanttiy = () => {
        let qtyList = [...quantityList];
        qtyList.push({ id: (qtyList.length + 1).toString(), quantity: 0, option: null });
        setQuantityList(qtyList)
        console.log(qtyList)
    }

    const handleDeleteQuantity = (id: string) => {
        setQuantityList((prev: any) => prev.filter((x: any) => x.id != id));
    }

    const handleSaveEditQuantityModal = () => {
        calculateUnitsQuanttiy();
        setEditQuantityModalOpen(false);
    }

    useEffect(() => {
        getProductList();
        getSupplierList();
        getProductUnitHierarchy(product_id ?? '');
        getWarehouseList();

        if (id) {
            getExistingStock(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px', overflowY: 'auto', height: '95vh', width: '100%' }}>
            <Alert severity="error" hidden={!showError}>{`Failed to create stock.`}</Alert>
            <br />
            <div className="pb-[40px]">
                <Typography variant="body1" fontWeight={'bold'}>Stock</Typography>

                <Grid container columnSpacing={4}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <Select options={productList} placeholder='Products' styles={{
                                control: (styles) => ({ ...styles, width: '100%', height: '55px' }),
                                menu: (styles) => ({ ...styles, width: '100%' }),
                                menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                            }}
                                value={product}
                                onChange={(option) => { setProduct(option); getProductUnitHierarchy(option?.value ?? ''); setQuantityList([]); setRoundupQuantity(""); }}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
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
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <Select options={warehouseList} placeholder='Warehouse' styles={{
                                control: (styles) => ({ ...styles, width: '100%', height: '55px' }),
                                menu: (styles) => ({ ...styles, width: '100%' }),
                                menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                            }}
                                value={warehouse}
                                onChange={(option) => setWarehouse(option)}
                            />
                        </div>
                    </Grid>
                    {/* <Grid size={{ xs: 12, sm: 6 }}>
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
                </Grid> */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px] flex gap-3">
                            <TextField type="text" InputLabelProps={{ shrink: !!roundupQuantity }} value={roundupQuantity} variant="outlined" label="Quantity" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                            <Button variant="outlined" onClick={() => setEditQuantityModalOpen(true)}><EditIcon /></Button>
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField type="number" InputLabelProps={{ shrink: !!stock.buying_price }} value={stock.buying_price} onChange={(e) => { handleInputChange("buying_price", e.target.value) }} variant="outlined" label="Buying Price" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField InputLabelProps={{ shrink: !!stock.note }} value={stock.note} onChange={(e) => { handleInputChange("note", e.target.value) }} variant="outlined" label="Note" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="flex gap-3 items-center pt-[20px]">
                            <Switch defaultChecked={fullyStored} value={fullyStored} onChange={() => setFullyStored(prev => !prev)} />
                            <Typography variant="body1" fontWeight={''}>Fully Stored</Typography>
                        </div>
                    </Grid>
                </Grid>
            </div>


            {/* <Divider />

            <div className="pt-[40px] pb-[40px]">
                <Typography variant="body1" fontWeight={'bold'}>Retail Price</Typography>

                <Grid container columnSpacing={4}>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField type="number" InputLabelProps={{ shrink: !!stock.selling_price }} value={stock.selling_price} onChange={(e) => { handleInputChange("selling_price", e.target.value) }} variant="outlined" label="Selling Price" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField type="number" InputLabelProps={{ shrink: !!stock.fix_price }} value={stock.fix_price} onChange={(e) => { handleInputChange("fix_price", e.target.value) }} variant="outlined" label="Fixed Price" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                </Grid>
            </div>

            <Divider />
            <div className="pt-[40px] pb-[40px]">
                <Typography variant="body1" fontWeight={'bold'}>Wholesale Price</Typography>

                <Grid container columnSpacing={4}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField type="number" InputLabelProps={{ shrink: !!stock.wholesale_selling_price }} value={stock.wholesale_selling_price} onChange={(e) => { handleInputChange("wholesale_selling_price", e.target.value) }} variant="outlined" label="Wholesale Selling Price" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField type="number" InputLabelProps={{ shrink: !!stock.wholesale_fix_price }} value={stock.wholesale_fix_price} onChange={(e) => { handleInputChange("wholesale_fix_price", e.target.value) }} variant="outlined" label="Wholesale Fixed Price" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px] flex gap-4">
                            <TextField type="number" InputLabelProps={{ shrink: !!stock.wholesale_starting_quantity }} value={stock.wholesale_starting_quantity} onChange={(e) => { handleInputChange("wholesale_starting_quantity", e.target.value) }} variant="outlined" label="Wholesale Starting Quantity" sx={{ width: { xs: '70%', lg: '70%' }, zIndex: 0 }} />
                            <div className="w-[30%]">
                                <Select options={unitList} placeholder='Unit' styles={{
                                    control: (styles) => ({ ...styles, width: '100%', height: '55px' }),
                                    menu: (styles) => ({ ...styles, width: '100%' }),
                                    menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                                }}
                                    value={wholesaleUnit}
                                    onChange={(option) => setWholesaleUnit(option)}
                                />
                            </div>

                        </div>
                    </Grid>
                </Grid>
            </div> */}


            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/product'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>


            <Modal open={editQuantityModalOpen} onClose={handleEditQuantityModalClose}>
                <div className='flex items-center justify-center mt-[20vh]'>
                    <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px', width: { md: '40%' } }}>
                        <br />
                        <div className="flex justify-between items-center pb-[30px]">
                            <Typography variant="body1" fontWeight={'bold'}>Quantities</Typography>
                            <Button variant="outlined" onClick={() => handleAddQuanttiy()}>Add Quantity</Button>
                        </div>

                        {
                            quantityList.map((qty: any, index: number) =>
                                <div className="md:flex gap-4 pb-[30px]" key={index}>
                                    <div className="md:w-[40%]">
                                        <TextField type="number" value={qty.quantity} label="Quantity" onChange={(e) => handleQuantityChange(e.target.value, qty.id)} />
                                    </div>
                                    <div className="md:w-[45%]">
                                        <Select options={unitList} placeholder='Units' styles={{
                                            control: (styles) => ({ ...styles, width: '100%', height: '55px' }),
                                            menu: (styles) => ({ ...styles, width: '100%' }),
                                            menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                                        }}
                                            value={qty.unit}
                                            onChange={(option) => handleQuantityUnitChange(option, qty.id)}
                                        />
                                    </div>
                                    <div className="md:w-[15%]">
                                        <Button variant="outlined" sx={{ height: '55px' }} onClick={() => handleDeleteQuantity(qty.id)}><DeleteIcon /></Button>
                                    </div>
                                </div>
                            )
                        }

                        <div className="flex justify-end pt-[20px] gap-4">
                            <Button variant="contained" onClick={() => handleSaveEditQuantityModal()}>Close</Button>
                        </div>
                    </Box>
                </div>
            </Modal>
        </Box>
    )
}



const EditQuantityModal = () => {

}

export default AddStock;