import { IProductRelation, ISupplierRelation, IUnitRelation, IWarehouseRelation } from "@/app/interfaces";
import { ITrack } from "./track.interface";

export interface IStockList {
    stock_id: string;
    stock_code: string;
    stock_product: string;
    stock_product_id: string;
    stock_supplier: string;
    stock_unit: string;
    stock_unit_id: string;
    stock_product_per_bag_quantity: string;
    stock_product_per_bag_unit_id: string;
    quantity: string;
    buying_price: string;
    selling_price: string
    fix_price: string;
    buying_price_formatted: string;
    selling_price_formatted: string;
    fix_price_formatted: string;
    wholesale_selling_price: string;
    wholesale_fix_price: string;
    wholesale_starting_quantity: string;
    note: string;
    created_on: string;
}

export interface IStock {
    stock_code: string;
    product: IProductRelation;
    supplier: ISupplierRelation;
    warehouse: IWarehouseRelation;
    unit: IUnitRelation;
    quantity: string;
    buying_price: string;
    buying_price_lowest_unit: string;
    selling_price: string;
    fix_price: string;
    wholesale_selling_price: string;
    wholesale_fix_price: string;
    wholesale_starting_quantity: string;
    wholesale_starting_unit: IUnitRelation;
    note: string;
    stock_tracks: IStockTrack[]
}

export interface IStockTrack {
    warehouse: IWarehouseRelation;
    quantity: string;
    unit: IUnitRelation
    checked_date: string;
    status: string;
    note?: string;
}


export type EditQuantityComponentProps = {
    quantityList: any,
    handleClose: () => void,
    handleRefresh: () => void
}