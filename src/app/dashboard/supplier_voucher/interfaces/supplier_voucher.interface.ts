import { IStockRelation, ISupplierRelation } from "@/app/interfaces";

export interface ISupplierVoucherList {
    voucher_id: string;
    voucher_code: string;
    supplier: string;
    total_amount: string;
    total_paid: string;
    total_unpaid: string;
    created_on: string;
}

export interface ISupplierVoucher {
    voucher_code: string;
    total_amount: number;
    total_paid: number;
    supplier?: ISupplierRelation;
    stocks: ISupplierVoucherStock[],
    payments: ISupplierVoucherPayment[]
}


export interface ISupplierVoucherStock {
    stock: IStockRelation
}

export interface ISupplierVoucherPayment {
    amount: string;
    payment_date: string;
    payment_channel?: string;
    note?: string;
}
