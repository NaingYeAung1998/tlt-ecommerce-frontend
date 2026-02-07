export interface ISelect {
    value: string;
    label: string;
    __isNew__?: boolean
}

export interface IQunatityCalculatorParent {
    quantity: number,
    unitId: string
}

export interface IUnitRelation {
    unit_id: string
}

export interface IProductRelation {
    product_id: string
}

export interface IStockRelation {
    stock_id: string
}

export interface ISupplierRelation {
    supplier_id: string
}

export interface ICustomerRelation {
    customer_id: string
}

export interface IGradeRelation {
    grade_id: string
}

export interface ICategoryRelation {
    category_id: string
}

export interface IWarehouseRelation {
    warehouse_id: string
}