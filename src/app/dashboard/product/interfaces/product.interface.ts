import { ICategoryRelation, IGradeRelation, IUnitRelation } from "@/app/interfaces";

export interface IProductList {
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
    missing_quantity: string,
    lowest_unit_id: string,
    created_on: string;
}

export interface IProduct {
    product_name: string;
    product_code: string;
    product_description: string;
    note: string;
    category?: ICategoryRelation;
    grade?: IGradeRelation;
    quantity_per_bag: number;
    per_bag_unit?: IUnitRelation;
    selling_price: string,
    fix_price: string
    wholesale_selling_price: string,
    wholesale_fix_price: string,
    wholesale_starting_quantity: string,
    wholesale_starting_unit: IUnitRelation;
}

// export interface IProductCategory {
//     category_id?: string | null;
// }

// export interface IProductGrade {
//     grade_id?: string | null;
// }

// export interface IProductBagUnit {
//     unit_id?: string | null
// }