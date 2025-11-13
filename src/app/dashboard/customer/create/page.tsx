"use client"

import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ICustomer } from "../interfaces/customer.interface";

function AddCustomer() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [customer, setCustomer] = useState<ICustomer>({} as ICustomer)
    const [showError, setShowError] = useState(false);

    const handleInputChange = (field: 'customer_name' | 'customer_address' | 'customer_phone' | 'note', value: string) => {
        setCustomer({ ...customer, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...customer };
        if (id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "customer/" + id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/customer?showSuccess=true&action=update&customer=" + customer.customer_name);
            } else {
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "customer"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/customer?showSuccess=true&action=create&customer=" + customer.customer_name);
            } else {
                setShowError(true)
            }
        }

    }

    const getExistingCustomer = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "customer"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            setCustomer(result);
        }
    }

    useEffect(() => {
        console.log(id)
        if (id) {

            getExistingCustomer(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px' }}>
            <Alert severity="error" hidden={!showError}>{`Failed to create Customer.`}</Alert>
            <br />

            <Typography variant="body1" fontWeight={'bold'}>Add Customer</Typography>
            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!customer.customer_name }} value={customer.customer_name} onChange={(e) => { handleInputChange("customer_name", e.target.value) }} variant="outlined" label="Name" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!customer.customer_address }} value={customer.customer_address} onChange={(e) => { handleInputChange("customer_address", e.target.value) }} variant="outlined" label="Address" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!customer.customer_phone }} value={customer.customer_phone} onChange={(e) => { handleInputChange("customer_phone", e.target.value) }} variant="outlined" label="Phone" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!customer.note }} value={customer.note} onChange={(e) => { handleInputChange("note", e.target.value) }} variant="outlined" label="Note" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/customer'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>

        </Box>
    )
}
export default AddCustomer;