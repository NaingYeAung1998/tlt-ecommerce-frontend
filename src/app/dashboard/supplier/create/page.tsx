"use client"

import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ISupplier } from "../interfaces/supplier.interface";
import Link from "next/link";

function AddSupplier() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [supplier, setSupplier] = useState<ISupplier>({} as ISupplier)
    const [showError, setShowError] = useState(false);

    const handleInputChange = (field: 'supplier_name' | 'supplier_address' | 'supplier_phone' | 'note', value: string) => {
        setSupplier({ ...supplier, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...supplier };
        if (id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "supplier/" + id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/supplier?showSuccess=true&action=update&supplier=" + supplier.supplier_name);
            } else {
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "supplier"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/supplier?showSuccess=true&action=create&supplier=" + supplier.supplier_name);
            } else {
                setShowError(true)
            }
        }

    }

    const getExistingSupplier = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "supplier"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            setSupplier(result);
        }
    }

    useEffect(() => {
        console.log(id)
        if (id) {

            getExistingSupplier(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px' }}>
            <Alert severity="error" hidden={!showError}>{`Failed to create supplier.`}</Alert>
            <br />

            <Typography variant="body1" fontWeight={'bold'}>Add Supplier</Typography>
            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!supplier.supplier_name }} value={supplier.supplier_name} onChange={(e) => { handleInputChange("supplier_name", e.target.value) }} variant="outlined" label="Name" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!supplier.supplier_address }} value={supplier.supplier_address} onChange={(e) => { handleInputChange("supplier_address", e.target.value) }} variant="outlined" label="Address" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!supplier.supplier_phone }} value={supplier.supplier_phone} onChange={(e) => { handleInputChange("supplier_phone", e.target.value) }} variant="outlined" label="Phone" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!supplier.note }} value={supplier.note} onChange={(e) => { handleInputChange("note", e.target.value) }} variant="outlined" label="Note" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/supplier'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>

        </Box>
    )
}
export default AddSupplier;