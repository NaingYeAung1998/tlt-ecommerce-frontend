import { IStockList } from "./stock.interface"

export interface IPaymentInfo extends IStockList {
    total_paid: number
    total_paid_formatted: string
}

export interface IPayment {
    payment_id: string;
    stock: IPaymentStock;
    amount: number;
    payment_date: string;
    payment_channel: string;
    note: string;
    created_on: string;
    amount_formatted: string;
}

export interface IPaymentStock {
    stock_id: string
}


export type StockPaymentProps = {
    stock_id: string
}

export type AddPaymentProps = {
    stock_id: string,
    handleClose: () => void,
    payment_id?: string,
    handleRefresh: () => void
}