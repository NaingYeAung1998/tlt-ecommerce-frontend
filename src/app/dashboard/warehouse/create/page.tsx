"use client"

import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IWarehouse } from "../intefaces/warehouse.interfaces";

function AddWarehouse() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [warehouse, setWarehouse] = useState<IWarehouse>({} as IWarehouse)
    const [showError, setShowError] = useState(false);

    const handleInputChange = (field: 'warehouse_name' | 'warehouse_address' | 'warehouse_phone' | 'note', value: string) => {
        setWarehouse({ ...warehouse, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...warehouse };
        if (id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "warehouse/" + id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/warehouse?showSuccess=true&action=update&warehouse=" + warehouse.warehouse_name);
            } else {
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "warehouse"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/warehouse?showSuccess=true&action=create&warehouse=" + warehouse.warehouse_name);
            } else {
                setShowError(true)
            }
        }

    }

    const getExistingWarehouse = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "warehouse"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            setWarehouse(result);
        }
    }

    useEffect(() => {
        console.log(id)
        if (id) {

            getExistingWarehouse(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px' }}>
            <Alert severity="error" hidden={!showError}>{`Failed to create warehouse.`}</Alert>
            <br />

            <Typography variant="body1" fontWeight={'bold'}>Add Warehouse</Typography>
            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!warehouse.warehouse_name }} value={warehouse.warehouse_name} onChange={(e) => { handleInputChange("warehouse_name", e.target.value) }} variant="outlined" label="Name" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!warehouse.warehouse_address }} value={warehouse.warehouse_address} onChange={(e) => { handleInputChange("warehouse_address", e.target.value) }} variant="outlined" label="Address" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!warehouse.warehouse_phone }} value={warehouse.warehouse_phone} onChange={(e) => { handleInputChange("warehouse_phone", e.target.value) }} variant="outlined" label="Phone" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!warehouse.note }} value={warehouse.note} onChange={(e) => { handleInputChange("note", e.target.value) }} variant="outlined" label="Note" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/warehouse'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>

        </Box>
    )
}
export default AddWarehouse;