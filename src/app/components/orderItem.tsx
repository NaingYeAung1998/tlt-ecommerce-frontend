import { FC, useEffect, useRef, useState } from "react"
import { ISelect } from "../interfaces"
import { IUnitList } from "../dashboard/unit/interfaces/unit.interface"
import { IOrderItem, IOrderItemDisplay } from "../dashboard/order/interfaces/order.interface"
import { IStockList } from "../dashboard/stock/interfaces/stock.interface"
import { Button, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Label } from "@mui/icons-material"
import Select from 'react-select'
import { IProductList } from "../dashboard/product/interfaces/product.interface"
import QuantityCalculator from "./quantityCalculator"
import { calculateLowestUnitQuantity, calculateRoundUpUnit, handleNextFocus, roundUpPrice } from "../utils"

type OrderItemProps = {
    products: IProductList[],
    item: IOrderItem,
    updateItem: (item: IOrderItemDisplay) => void,
    itemRef: React.RefObject<any>,
    nextRef?: React.RefObject<any>
}


const OrderItem: FC<OrderItemProps> = ({ products, item, updateItem, itemRef, nextRef }) => {

    const [unitHierarchy, setUnitHierarchy] = useState<IUnitList[]>([])
    const [productStocks, setProductStocks] = useState<IStockList[]>([])
    const [fixedPrice, setFixedPrice] = useState(0);
    const qtyRef = useRef<any>(null);
    const priceRef = useRef<any>(null);

    const getProductUnitHierarchy = async (product_id: string) => {
        if (product_id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "product/getProductUnitHierarchy/" + product_id
            let response = await fetch(url);
            if (response.ok) {
                let result: IUnitList[] = await response.json();
                if (result) {
                    setUnitHierarchy(result);

                    const prevItem = { ...item }
                    prevItem.unitHierarchy = result;
                    updateItem(prevItem)
                }
            }
        }

    }

    const getProductStocks = async (product_id: string) => {
        if (product_id) {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}stock/getByProduct?product_id=${product_id}&perPage=-1`;
            let response = await fetch(url);
            if (response.ok) {
                let result = await response.json();
                if (result) {
                    setProductStocks(result)
                    const prevItem = { ...item }
                    prevItem.productStocks = result;
                    updateItem(prevItem)
                }
            }
        }

    }

    const handleProductChange = async (option: any) => {
        if (option) {
            await getProductUnitHierarchy(option?.value)
            // await getProductStocks(option?.value)
            let prevItem: IOrderItemDisplay = { ...item }
            prevItem.product = { product_id: option.value }
            prevItem.product_name = option.label
            updateItem(prevItem)
        }
    }

    const handleStockChange = async (option: ISelect | null) => {
        if (option) {
            let prevItem: IOrderItemDisplay = { ...item }
            prevItem.stock = { stock_id: option.value }
            prevItem.stock_name = option.label
            updateItem(prevItem)
        }
    }

    const handleQuantityChange = (qty: number, unitId: string) => {
        let prevItem: IOrderItemDisplay = { ...item }
        prevItem.quantity = qty;
        prevItem.unit = { unit_id: unitId }
        let roundupQuantity = calculateRoundUpUnit(unitHierarchy, qty)
        let roundupQuantityString = '';
        roundupQuantity.forEach((qty) => {
            roundupQuantityString += `${qty.quantity} ${qty.unit_name} `;
        })
        prevItem.unit_quantity = roundupQuantityString;
        updateItem(prevItem)
    }

    const calculatePrice = () => {

        let prevItem = { ...item }
        let product = products.find(x => x.product_id == prevItem.product?.product_id);
        // let stock = productStocks.find(x => x.stock_id == prevItem.stock?.stock_id);

        if (product) {
            let product_quantity_per_bag = calculateLowestUnitQuantity(unitHierarchy, [{ unit_id: product.product_per_bag_unit_id, quantity: product.product_per_bag_qty }])
            let perBagPrice = prevItem.quantity >= parseFloat(product.wholesale_starting_quantity) ? parseFloat(product.wholesale_selling_price) : parseFloat(product.selling_price)
            let perBagFixedPrice = prevItem.quantity >= parseFloat(product.wholesale_starting_quantity) ? parseFloat(product.wholesale_fix_price) : parseFloat(product.fix_price)
            let price = (perBagPrice / product_quantity_per_bag.quantity) * prevItem.quantity;
            let fixedPrice = (perBagFixedPrice / product_quantity_per_bag.quantity) * prevItem.quantity;

            setFixedPrice(roundUpPrice(fixedPrice.toString()))
            prevItem.selling_price = roundUpPrice(price.toString());
            updateItem(prevItem)
        } else {
            setFixedPrice(0)
            prevItem.selling_price = 0;
            updateItem(prevItem)
        }
    }

    const handlePriceChange = (value: string) => {
        let prevItem = { ...item }
        prevItem.selling_price = parseFloat(value);
        updateItem(prevItem)

    }

    const handlePriceFocus = () => {
        setTimeout(() => {
            if (priceRef.current) {
                priceRef.current.focus();
            }
        }, 50);
    }

    useEffect(() => {
        calculatePrice()
    }, [item.product, item.stock, item.quantity])

    useEffect(() => {
        getProductUnitHierarchy(item.product ? item.product.product_id : '');
        // getProductStocks(item.product ? item.product.product_id : '');
    }, [item.product])

    const productOptions: ISelect[] = products.map((product) => { return { value: product.product_id, label: `${product.product_name} (${product.product_grade}) (${product.product_code})` } })
    const productStockOptions: ISelect[] = productStocks.map((stock) => { return { value: stock.stock_id, label: stock.stock_supplier } })


    const productLabel = productOptions.find(x => x.value == item.product?.product_id)?.label
    const productOption = { value: item.product?.product_id, label: productLabel ? productLabel : '' }

    const stockLabel = productStockOptions.find(x => x.value == item.stock?.stock_id)?.label
    const stockOption = item.stock ? { value: item.stock?.stock_id, label: stockLabel ? stockLabel : '' } : null


    return (
        <Grid container sx={{ paddingTop: '20px' }} spacing={4}>
            <Grid size={{ sm: 12, md: 6 }}>
                <Select options={productOptions} placeholder='Stocks' styles={{
                    control: (styles) => ({ ...styles, width: '100%', height: '60px' }),
                    menu: (styles) => ({ ...styles, width: '100%' }),
                    menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '50%' })
                }}
                    value={productOption}
                    onChange={(option) => handleProductChange(option)}
                    ref={itemRef}
                    onKeyDown={(e) => handleNextFocus(e, qtyRef)}
                />
            </Grid>
            {/* <Grid size={{ sm: 12, md: 6 }}>
                <Select options={productStockOptions} placeholder='Stocks' styles={{
                    control: (styles) => ({ ...styles, width: '100%', height: '60px' }),
                    menu: (styles) => ({ ...styles, width: '100%' }),
                    menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '50%' })
                }}
                    value={stockOption}
                    onChange={(option) => handleStockChange(option)}
                />
            </Grid> */}
            <Grid size={{ sm: 12, md: 6 }}>
                <QuantityCalculator qtyRef={qtyRef} nextFocus={() => handlePriceFocus()} unitHierarchy={item.unitHierarchy.length > 0 ? item.unitHierarchy : unitHierarchy} parentId={item.item_id ? item.item_id : ''} parentQty={item.quantity} parentUnitId={item.unit ? item.unit.unit_id : ''} updateParent={handleQuantityChange} />
            </Grid>
            <Grid size={{ sm: 12, md: 6 }}>
                <TextField inputRef={priceRef} InputLabelProps={{ shrink: true }} label={"Fixed Price:" + fixedPrice} type="number" value={item.selling_price} onChange={(e) => { handlePriceChange(e.target.value) }} onKeyDown={(e) => { if (nextRef) { e.preventDefault(); handleNextFocus(e, nextRef) } }} sx={{ zIndex: 0 }} />
            </Grid>
        </Grid>
    )
}

type OrderItemDisplayProps = {
    item_id?: string,
    product_name?: string,
    stock_name?: string
    unit_quantity?: string
    selling_price?: string,
    handleEdit: (id?: string) => void,
    handleDelete: (id?: string) => void
}

export const OrderItemDisplay: FC<OrderItemDisplayProps> = ({ item_id, product_name, stock_name, unit_quantity, selling_price, handleEdit, handleDelete }) => {
    return (

        <TableRow>
            <TableCell style={{ maxWidth: '100px' }}>
                {product_name}
            </TableCell>
            {/* <TableCell style={{ maxWidth: '100px' }}>
                {stock_name}
            </TableCell> */}
            <TableCell style={{ maxWidth: '100px' }}>
                {unit_quantity}
            </TableCell>
            <TableCell style={{ maxWidth: '100px' }}>
                {selling_price}
            </TableCell>
            <TableCell align="right" style={{ width: '100px' }}>
                <div className="flex items-center gap-2 w-[100px]">
                    <IconButton color="primary" onClick={() => handleEdit(item_id)} size="small"><EditIcon fontSize="small" /></IconButton>
                    <IconButton color="warning" onClick={() => handleDelete(item_id)}><DeleteIcon /></IconButton>
                </div></TableCell>
        </TableRow>
    )
}

export default OrderItem