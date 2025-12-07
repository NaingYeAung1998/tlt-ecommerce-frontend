export interface ISupplierVoucherList {
    voucher_id: string;
    voucher_code: string;
    supplier: string;
    total_amount: string;
    total_paid: string;
    created_on: string;
}

export interface ISupplierVoucher {
    voucher_code: string;
    total_amount: number;
    total_paid: number;
    supplier: ISupplierVoucherSupplier;
    stocks: ISupplierVoucherStock[],
    payments: ISupplierVoucherPayment[]
}

export interface ISupplierVoucherSupplier {
    supplier_id?: string;
}

export interface ISupplierVoucherStock {
    stock: ISupplierVoucherStockId
}

export interface ISupplierVoucherStockId {
    stock_id: string;
}

export interface ISupplierVoucherPayment {
    amount: string;
    payment_date: string;
    payment_channel?: string;
    note?: string;
}