export interface IStockList {
    stock_id: string;
    stock_code: string;
    stock_product: string;
    stock_product_id: string;
    stock_supplier: string;
    stock_unit: string;
    stock_unit_id: string;
    quantity: string;
    buying_price: string;
    selling_price: string
    fix_price: string;
    buying_price_formatted: string;
    selling_price_formatted: string;
    fix_price_formatted: string;
    note: string;
    created_on: string;
}

export interface IStock {
    stock_code: string;
    product: IStockProduct;
    supplier: IStockSupplier;
    warehouse: IStockWarehouse;
    unit: IStockUnit;
    quantity: string;
    buying_price: string;
    selling_price: string;
    fix_price: string;
    wholesale_selling_price: string;
    wholesale_fix_price: string;
    wholesale_starting_quantity: string;
    wholesale_starting_unit: IStockUnit;
    note: string;
}

export interface IStockProduct {
    product_id: string;
}

export interface IStockSupplier {
    supplier_id: string;
}


export interface IStockWarehouse {
    warehouse_id: string;
}

export interface IStockUnit {
    unit_id: string;
}


export type EditQuantityComponentProps = {
    quantityList: any,
    handleClose: () => void,
    handleRefresh: () => void
}