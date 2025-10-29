"use client"

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Alert, Box, Button, Grid, IconButton, Input, InputAdornment, Modal, TextField, Typography } from '@mui/material';
import { Delete, Edit, Search as SearchIcon } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
import { FC, KeyboardEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { MOMENT_FORMAT, TRACK_STATUS_LIST } from '@/app/constants';
import { AddTrackProps, ITrack, ITrackList, StockTrackProps } from '../interfaces/track.interface';
import Select from 'react-select'
import { ISelect } from '@/app/interfaces';

interface Column {
    id: 'quantity' | 'checked_date' | 'status' | 'note' | 'created_on';
    label: string;
    minWidth?: number;
    align?: 'right' | 'left';
}

const columns: readonly Column[] = [
    { id: 'quantity', label: 'Quantity', minWidth: 170 },
    { id: 'checked_date', label: 'Checked Date', minWidth: 100 },
    {
        id: 'status',
        label: 'Status',
        minWidth: 170,
        align: 'left',
    },
    {
        id: 'note',
        label: 'Note',
        minWidth: 170,
        align: 'left',

    },
    {
        id: 'created_on',
        label: 'Created Date',
        minWidth: 170,
        align: 'left',
    },
];


const Tracks: FC<StockTrackProps> = ({ stock_id }) => {
    const searchParams = useSearchParams();

    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0)
    const [perPage, setPerPage] = useState(10);
    const [rows, setRows] = useState<ITrackList[]>([]);
    const [totalLength, setTotalLength] = useState(0);
    const [addTrackModal, setAddTrackModal] = useState(false);
    const [selectedTrackId, setSelectedTrackId] = useState('');
    const showSuccess = searchParams.get('showSuccess');
    const track = searchParams.get('track');
    const action = searchParams.get('action');

    const handleChangePage = (event: unknown, newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPerPage(+event.target.value);
        setCurrentPage(0);
    };

    const handleSearch = async (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            await getTracks()
        }
    }

    const handleAddTrackModalClose = () => {
        setAddTrackModal(false);
    }

    const getTracks = async () => {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}stock/track/getByStock?stock_id=${stock_id}}search=${search}&currentPage=${currentPage}&perPage=${perPage}`;
        let response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            setRows(result.data);
            setTotalLength(result.totalLength)
        } else {

        }
    }

    useEffect(() => {
        getTracks();
    }, [])

    useEffect(() => {
        getTracks()
    }, [currentPage, perPage])

    return (
        <div>
            <Alert severity='success' hidden={!showSuccess}>{`Track ${track} successfully ${action === 'update' ? 'updated' : 'created'}.`}</Alert>
            <Box sx={{ padding: 2 }}>
                <div className='flex justify-end pb-5'>
                    <Button variant='contained' color='primary' onClick={() => setAddTrackModal(true)}>Add Track</Button>
                </div>
                <Grid container sx={{ paddingTop: '20px' }}>
                    <Grid size={6}>
                        <Typography variant='body1' fontWeight={'bold'}>Tracks</Typography>
                    </Grid>
                    <Grid size={6}>
                        <div className='flex justify-end'>
                            <Input
                                sx={{ fontSize: '15px' }}
                                placeholder='Search...'
                                id="input-with-icon-adornment"
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyUp={(e) => handleSearch(e)}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <SearchIcon />
                                    </InputAdornment>
                                }
                            />
                        </div>
                    </Grid>
                </Grid>

            </Box>
            <TableContainer sx={{ height: '58vh' }}>

                <Table aria-label="sticky table" stickyHeader={true}>
                    <TableHead>
                        <TableRow>
                            <TableCell>No.</TableCell>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .map((row, index) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.track_id}>
                                        <TableCell>{(currentPage * perPage) + index + 1}</TableCell>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.id == 'created_on' ? moment(value).format(MOMENT_FORMAT) : value}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell align='right'>
                                            <div>
                                                <IconButton color='default' onClick={() => setAddTrackModal(true)}><Edit /></IconButton>
                                                <IconButton color='warning'><Delete /></IconButton>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={totalLength}
                rowsPerPage={perPage}
                page={currentPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Modal open={addTrackModal} onClose={handleAddTrackModalClose} disableEscapeKeyDown={false}>
                <AddTrack stock_id={stock_id} handleClose={handleAddTrackModalClose} track_id={selectedTrackId} />
            </Modal>
        </div>

    );
}

const AddTrack: FC<AddTrackProps> = ({ stock_id, handleClose, track_id }) => {

    const [track, setTrack] = useState<ITrack>({ stock: { stock_id } } as ITrack)
    const [status, setStatus] = useState<ISelect | null>(null);
    const today = new Date()
    const [checkedDate, setCheckedDate] = useState(today.toISOString().split('T')[0]);
    const [showError, setShowError] = useState(false);

    const handleInputChange = (field: 'quantity' | 'checked_date' | 'note', value: string) => {
        setTrack({ ...track, [field]: value })
    }

    const handleSave = async () => {
        const data = { ...track };
        data.status = status ? status?.value : '';
        data.checked_date = checkedDate;
        if (track_id) {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock/track/" + track_id
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
            } else {
                setShowError(true)
            }
        } else {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock/track"
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
            } else {
                setShowError(true)
            }
        }

    }

    const getExistingTrack = async (id: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "stock/track"
        let response = await fetch(url + "/" + id);
        if (response.ok) {
            let result = await response.json();
            setTrack(result);
        }
    }

    useEffect(() => {
        if (track_id) {

            getExistingTrack(track_id);
        }
    }, [])

    return (
        <div className='flex items-center justify-center mt-[20vh]'>
            <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px', width: '50%' }}>
                <Alert severity="error" hidden={!showError}>{`Failed to create Track.`}</Alert>
                <br />

                <Typography variant="body1" fontWeight={'bold'}>Add Track</Typography>

                <Grid container columnSpacing={4} sx={{ paddingBottom: '20px' }}>
                    <Grid size={6}>
                        <div className="pt-[20px]">
                            <Select options={TRACK_STATUS_LIST} placeholder='Status' styles={{
                                control: (styles) => ({ ...styles, width: '100%', height: '55px' }),
                                menu: (styles) => ({ ...styles, width: '100%' }),
                                menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                            }}
                                value={status}
                                onChange={(option) => setStatus(option)}
                            />
                        </div>
                    </Grid>
                    <Grid size={6}>
                        <div className="pt-[20px]">
                            <TextField type='number' InputLabelProps={{ shrink: !!track.quantity }} value={track.quantity} onChange={(e) => { handleInputChange("quantity", e.target.value) }} variant="outlined" label="Quantity" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={6}>
                        <div className="pt-[20px]">
                            <TextField InputLabelProps={{ shrink: !!track.note }} value={track.note} onChange={(e) => { handleInputChange("note", e.target.value) }} variant="outlined" label="Note" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                        </div>
                    </Grid>
                    <Grid size={6}>
                        <div className="pt-[20px]">
                            <div className='w-[100%] border-[#CCCCCC] border-[1px] h-[55px] rounded-[7px] justify-center flex items-center'>
                                <label className='text-[#777777]'>Checked Date - &nbsp; &nbsp;</label>
                                <input type='date' value={checkedDate} onChange={(e) => setCheckedDate(e.target.value)} />
                            </div>
                        </div>
                    </Grid>

                </Grid>


                <div className="flex justify-end pt-[20px] gap-4">
                    <Button variant="outlined" color="warning" onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={() => handleSave()}>{track_id ? 'Update' : 'Create'}</Button>
                </div>

            </Box>
        </div>

    )
}

export default Tracks;