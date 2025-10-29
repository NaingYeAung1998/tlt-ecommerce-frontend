export interface IProductList {
    product_id: string;
    product_name: string;
    product_code: string;
    product_description: string;
    product_category: string;
    product_grade: string;
    created_on: string;
}

export interface IProduct {
    product_name: string;
    product_code: string;
    product_description: string;
    note: string;
    category: IProductCategory;
    grade: IProductGrade;
}

export interface IProductCategory {
    category_id: string;
}

export interface IProductGrade {
    grade_id: string;
}