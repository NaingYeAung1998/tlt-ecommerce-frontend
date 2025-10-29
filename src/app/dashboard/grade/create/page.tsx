"use client"

import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IGrade } from "../interfaces/grade.interface";

function AddGrade() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const router = useRouter();
    const [grade, setGrade] = useState<IGrade>({} as IGrade)
    const [showError, setShowError] = useState(false);

    const handleInputChange = (field: 'grade_name' | 'grade_description', value: string) => {
        setGrade({ ...grade, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...grade };
        if (id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "grade/" + id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/grade?showSuccess=true&action=update&grade=" + grade.grade_name);
            } else {
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "grade"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                router.push("/dashboard/grade?showSuccess=true&action=create&grade=" + grade.grade_name);
            } else {
                setShowError(true)
            }
        }

    }

    const getExistingGrade = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "grade"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            setGrade(result);
        }
    }

    useEffect(() => {
        console.log(id)
        if (id) {

            getExistingGrade(id);
        }
    }, [])

    return (
        <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px' }}>
            <Alert severity="error" hidden={!showError}>{`Failed to create Grade.`}</Alert>
            <br />

            <Typography variant="body1" fontWeight={'bold'}>Add Grade</Typography>
            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!grade.grade_name }} value={grade.grade_name} onChange={(e) => { handleInputChange("grade_name", e.target.value) }} variant="outlined" label="Name" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="pt-[20px]">
                <TextField InputLabelProps={{ shrink: !!grade.grade_description }} value={grade.grade_description} onChange={(e) => { handleInputChange("grade_description", e.target.value) }} variant="outlined" label="Description" sx={{ width: { xs: '100%', lg: '50%' } }} />
            </div>

            <div className="flex justify-end pt-[20px] gap-4">
                <Link href={'/dashboard/grade'}><Button variant="outlined" color="warning">Cancel</Button></Link>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>{id ? 'Update' : 'Create'}</Button>
            </div>

        </Box>
    )
}
export default AddGrade;