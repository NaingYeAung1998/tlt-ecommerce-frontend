"use client"

import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IProduct } from "../interfaces/product.interface";
import Select from 'react-select'
import { ISelect } from "@/app/interfaces";
import { ICategory } from "../../category/interfaces/category.interface";
import { IGrade } from "../../grade/interfaces/grade.interface";

function AddProduct() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [product, setProduct] = useState<IProduct>({} as IProduct)
    const [categoryList, setCategoryList] = useState<ISelect[]>([]);
    const [gradeList, setGradeList] = useState<ISelect[]>([]);
    const [category, setCategory] = useState<ISelect | null>(null);
    const [grade, setGrade] = useState<ISelect | null>(null);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleInputChange = (field: 'product_name' | 'product_code' | 'product_description' | 'note', value: string) => {
        setProduct({ ...product, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...product };
        data.category = { category_id: '' };
        data.grade = { grade_id: '' };
        data.category.category_id = category ? category.value : '';
        data.grade.grade_id = grade ? grade.value : '';
        console.log(data);
        if (id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "product/" + id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/product?showSuccess=true&action=update&product=" + product.product_name);
            } else {
                let error = await response.json();
                setErrorMessage(error?.message);
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "product"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/product?showSuccess=true&action=create&product=" + product.product_name);
            } else {
                let error = await response.json();
                setErrorMessage(error?.message);
                setShowError(true)
            }
        }

    }

    const getCategoryList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "category?perPage=-1"
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            let options: ISelect[] = [];
            result.forEach((category: ICategory, index: number) => {
                let option: ISelect = { value: category.category_id, label: category.category_name }
                options.push(option);
            })
            setCategoryList(options);
        }
    }

    const getGradeList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "grade?perPage=-1"
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            let options: ISelect[] = [];
            result.forEach((grade: IGrade, index: number) => {
                let option: ISelect = { value: grade.grade_id, label: grade.grade_name }
                options.push(option);
            })
            setGradeList(options);
        }
    }

    const getExistingProduct = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "product"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            setProduct(result);
            setCategory({ value: result.category?.category_id, label: result.category?.category_name });
            setGrade({ value: result.grade?.grade_id, label: result.grade?.grade_name });
        }
    }

    useEffect(() => {
        getCategoryList();
        getGradeList();

        if (id) {
            getExistingProduct(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px' }}>
            <Alert severity="error" hidden={!showError}><div className="flex items-center gap-2">{`Failed to create product: `} <Typography fontWeight={'bold'}>{errorMessage}</Typography></div></Alert>
            <br />

            <Typography variant="body1" fontWeight={'bold'}>Add Product</Typography>
            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!product.product_name }} value={product.product_name} onChange={(e) => { handleInputChange("product_name", e.target.value) }} variant="outlined" label="Name" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!product.product_code }} value={product.product_code} onChange={(e) => { handleInputChange("product_code", e.target.value) }} variant="outlined" label="Code" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <Select options={categoryList} placeholder='Categories' styles={{
                    control: (styles) => ({ ...styles, width: '50%', height: '60px' }),
                    menu: (styles) => ({ ...styles, width: '50%' }),
                    menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '50%' })
                }}
                    value={category}
                    onChange={(option) => setCategory(option)}
                />
            </div>

            <div className="pt-[20px]">
                <Select options={gradeList} placeholder='Grades' styles={{
                    control: (styles) => ({ ...styles, width: '50%', height: '60px' }),
                    menu: (styles) => ({ ...styles, width: '50%' }),
                    menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '50%' })
                }}
                    value={grade}
                    onChange={(option) => setGrade(option)}
                />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!product.product_description }} value={product.product_description} onChange={(e) => { handleInputChange("product_description", e.target.value) }} variant="outlined" label="Description" sx={{ width: { xs: '100%', lg: '50%' }, zIndex: 0 }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!product.note }} value={product.note} onChange={(e) => { handleInputChange("note", e.target.value) }} variant="outlined" label="Note" sx={{ width: { xs: '100%', lg: '50%' }, zIndex: 0 }} />
            </div>

            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/product'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>

        </Box>
    )
}
export default AddProduct;