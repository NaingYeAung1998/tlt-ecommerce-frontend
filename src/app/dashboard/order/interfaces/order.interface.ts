import { ICustomerRelation, IProductRelation, IStockRelation, IUnitRelation } from "@/app/interfaces";
import { IUnitList } from "../../unit/interfaces/unit.interface";
import { IStockList } from "../../stock/interfaces/stock.interface";

export interface IOrderList {
    order_id: string;
    voucher_code: string;
    customer_name: string;
    total_amount: string;
    total_paid: string;
    created_on: string;
}

export interface IOrder {
    voucher_code: string;
    total_amount: number;
    total_paid: number;
    customer_name: string;
    order_date: string;
    other_charges: string;
    address: string;
    customer?: ICustomerRelation;
    items: IOrderItem[],
    payments: IOrderPayment[]
}


export interface IOrderItem {
    item_id?: string;
    product?: IProductRelation
    stock?: IStockRelation,
    quantity: number,
    missing_quantity: number,
    selling_price?: number,
    unit?: IUnitRelation,
    unitHierarchy: IUnitList[],
    productStocks: IStockList[],
    sortOrder?: number
}

export interface IOrderItemDisplay extends IOrderItem {
    product_name?: string;
    stock_name?: string;
    unit_quantity?: string;
}

export interface IOrderPayment {
    order_payment_id?: string;
    amount: string;
    payment_date: string;
    payment_channel?: string;
    note?: string;
}

