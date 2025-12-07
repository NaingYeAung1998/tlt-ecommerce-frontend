export interface IProductList {
    product_id: string;
    product_name: string;
    product_code: string;
    product_description: string;
    product_category: string;
    product_grade: string;
    product_quantity_per_bag: string;
    created_on: string;
}

export interface IProduct {
    product_name: string;
    product_code: string;
    product_description: string;
    note: string;
    category: IProductCategory;
    grade: IProductGrade;
    quantity_per_bag: number;
    per_bag_unit: IProductBagUnit;
}

export interface IProductCategory {
    category_id?: string | null;
}

export interface IProductGrade {
    grade_id?: string | null;
}

export interface IProductBagUnit {
    unit_id?: string | null
}