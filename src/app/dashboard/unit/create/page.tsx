"use client"

import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IUnit } from "../interfaces/unit.interface";

function AddUnit() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [unit, setUnit] = useState<IUnit>({} as IUnit)
    const [showError, setShowError] = useState(false);

    const handleInputChange = (field: 'unit_name' | 'unit_symbol', value: string) => {
        setUnit({ ...unit, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...unit };
        if (id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "unit/" + id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/unit?showSuccess=true&action=update&unit=" + unit.unit_name);
            } else {
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "unit"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/unit?showSuccess=true&action=create&unit=" + unit.unit_name);
            } else {
                setShowError(true)
            }
        }

    }

    const getExistingUnit = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "unit"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            setUnit(result);
        }
    }

    useEffect(() => {
        console.log(id)
        if (id) {

            getExistingUnit(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px' }}>
            <Alert severity="error" hidden={!showError}>{`Failed to create Unit.`}</Alert>
            <br />

            <Typography variant="body1" fontWeight={'bold'}>Add Unit</Typography>
            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!unit.unit_name }} value={unit.unit_name} onChange={(e) => { handleInputChange("unit_name", e.target.value) }} variant="outlined" label="Name" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!unit.unit_symbol }} value={unit.unit_symbol} onChange={(e) => { handleInputChange("unit_symbol", e.target.value) }} variant="outlined" label="Symbol" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/unit'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>

        </Box>
    )
}
export default AddUnit;