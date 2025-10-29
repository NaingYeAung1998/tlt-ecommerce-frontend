export interface IStockList {
    stock_id: string;
    stock_code: string;
    stock_product: string;
    stock_supplier: string;
    stock_unit: string;
    quantity: string;
    buying_price: string;
    selling_price: string;
    fix_price: string;
    note: string;
    created_on: string;
}

export interface IStock {
    stock_code: string;
    product: IStockProduct;
    supplier: IStockSupplier;
    unit: IStockUnit;
    quantity: string;
    buying_price: string;
    selling_price: string;
    fix_price: string;
    note: string;
}

export interface IStockProduct {
    product_id: string;
}

export interface IStockSupplier {
    supplier_id: string;
}

export interface IStockUnit {
    unit_id: string;
}