"use client"

import { Alert, Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IProduct } from "../interfaces/product.interface";
import Select from 'react-select'
import { ISelect } from "@/app/interfaces";
import { ICategory } from "../../category/interfaces/category.interface";
import { IGrade } from "../../grade/interfaces/grade.interface";
import { Divider } from "@/app/components/divider";
import { IUnit } from "../../unit/interfaces/unit.interface";

function AddProduct() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [product, setProduct] = useState<IProduct>({} as IProduct)
    const [categoryList, setCategoryList] = useState<ISelect[]>([]);
    const [gradeList, setGradeList] = useState<ISelect[]>([]);
    const [unitList, setUnitList] = useState<ISelect[]>([]);
    const [category, setCategory] = useState<ISelect | null>(null);
    const [grade, setGrade] = useState<ISelect | null>(null);
    const [perBagUnit, setPerBagUnit] = useState<ISelect | null>(null)
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleInputChange = (field: 'product_name' | 'product_code' | 'product_description' | 'quantity_per_bag' | 'note', value: string) => {
        setProduct({ ...product, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...product };
        data.category = category ? { category_id: category.value } : undefined;
        data.grade = grade ? { grade_id: grade.value } : undefined;
        data.per_bag_unit = perBagUnit ? { unit_id: perBagUnit.value } : undefined;
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
            if (result.category) {
                setCategory({ value: result.category.category_id, label: result.category.category_name });
            }
            if (result.grade) {
                setGrade({ value: result.grade.grade_id, label: result.grade.grade_name });
            }
            if (result.per_bag_unit) {
                setPerBagUnit({ value: result.per_bag_unit.unit_id, label: result.per_bag_unit.unit_name })
            }


        }
    }

    const getUnitList = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "unit?perPage=-1"
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            let options: ISelect[] = [];
            result.forEach((unit: IUnit, index: number) => {
                let option: ISelect = { value: unit.unit_id, label: unit.unit_name }
                options.push(option);
            })
            setUnitList(options);
        }
    }

    useEffect(() => {
        getCategoryList();
        getGradeList();
        getUnitList();

        if (id) {
            getExistingProduct(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px' }}>
            <Alert severity="error" hidden={!showError}><div className="flex items-center gap-2">{`Failed to create product: `} <Typography fontWeight={'bold'}>{errorMessage}</Typography></div></Alert>
            <br />
            <div className="pb-[40px]">
                <Typography variant="body1" fontWeight={'bold'}>Product</Typography>
                <Grid container columnSpacing={4}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField InputLabelProps={{ shrink: !!product.product_name }} value={product.product_name} onChange={(e) => { handleInputChange("product_name", e.target.value) }} variant="outlined" label="Name" sx={{ width: { xs: '100%', lg: '100%' } }} />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField InputLabelProps={{ shrink: !!product.product_code }} value={product.product_code} onChange={(e) => { handleInputChange("product_code", e.target.value) }} variant="outlined" label="Code" sx={{ width: { xs: '100%', lg: '100%' } }} />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <Select options={categoryList} placeholder='Categories' styles={{
                                control: (styles) => ({ ...styles, width: '100%', height: '60px' }),
                                menu: (styles) => ({ ...styles, width: '100%' }),
                                menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                            }}
                                value={category}
                                onChange={(option) => setCategory(option)}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <Select options={gradeList} placeholder='Grades' styles={{
                                control: (styles) => ({ ...styles, width: '100%', height: '60px' }),
                                menu: (styles) => ({ ...styles, width: '100%' }),
                                menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                            }}
                                value={grade}
                                onChange={(option) => setGrade(option)}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField InputLabelProps={{ shrink: !!product.product_description }} value={product.product_description} onChange={(e) => { handleInputChange("product_description", e.target.value) }} variant="outlined" label="Description" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField InputLabelProps={{ shrink: !!product.note }} value={product.note} onChange={(e) => { handleInputChange("note", e.target.value) }} variant="outlined" label="Note" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                    </Grid>
                </Grid>
            </div>
            <Divider />
            <div className="pt-[40px]">
                <Typography variant="body1" fontWeight={'bold'}>Unit Definition</Typography>
                <Grid container columnSpacing={4}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <Select options={unitList} placeholder='Per Bag Unit' styles={{
                                control: (styles) => ({ ...styles, width: '100%', height: '60px' }),
                                menu: (styles) => ({ ...styles, width: '100%' }),
                                menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                            }}
                                value={perBagUnit}
                                onChange={(option) => setPerBagUnit(option)}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className="pt-[20px]">
                            <TextField type="number" InputLabelProps={{ shrink: !!product.quantity_per_bag }} value={product.quantity_per_bag} onChange={(e) => { handleInputChange("quantity_per_bag", e.target.value) }} variant="outlined" label="Quantity Per Bag" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                </Grid>

            </div>

            <div className="flex justify-end pt-[40px] gap-4">
                <Link href={'/dashboard/product'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>

        </Box>
    )
}
export default AddProduct;