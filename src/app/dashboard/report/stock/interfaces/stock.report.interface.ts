export interface IStockReportList {
    product_id: string;
    product_name: string;
    product_code: string;
    product_description: string;
    product_category: string;
    product_grade: string;
    product_quantity_per_bag: string;
    product_per_bag_qty: string,
    product_per_bag_unit_id: string,
    selling_price: string,
    fix_price: string
    wholesale_selling_price: string,
    wholesale_fix_price: string,
    wholesale_starting_quantity: string,
    available_quantity: string,
    lowest_unit_id: string,
    created_on: string;
}