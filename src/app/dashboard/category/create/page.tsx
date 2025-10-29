"use client"

import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ICategory } from "../interfaces/category.interface";

function AddCategory() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [category, setCategory] = useState<ICategory>({} as ICategory)
    const [showError, setShowError] = useState(false);

    const handleInputChange = (field: 'category_name' | 'category_description', value: string) => {
        setCategory({ ...category, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...category };
        if (id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "category/" + id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/category?showSuccess=true&action=update&category=" + category.category_name);
            } else {
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "category"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/category?showSuccess=true&action=create&category=" + category.category_name);
            } else {
                setShowError(true)
            }
        }

    }

    const getExistingCategory = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "category"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            setCategory(result);
        }
    }

    useEffect(() => {
        console.log(id)
        if (id) {

            getExistingCategory(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px' }}>
            <Alert severity="error" hidden={!showError}>{`Failed to create Category.`}</Alert>
            <br />

            <Typography variant="body1" fontWeight={'bold'}>Add Category</Typography>
            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!category.category_name }} value={category.category_name} onChange={(e) => { handleInputChange("category_name", e.target.value) }} variant="outlined" label="Name" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!category.category_description }} value={category.category_description} onChange={(e) => { handleInputChange("category_description", e.target.value) }} variant="outlined" label="Description" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/category'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>

        </Box>
    )
}
export default AddCategory;