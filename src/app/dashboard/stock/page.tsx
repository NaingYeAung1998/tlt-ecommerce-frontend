"use client"

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Alert, Box, Button, Grid, IconButton, Input, InputAdornment, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Inventory, ListAlt, Search as SearchIcon, Update as UpdateIcon } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
import { KeyboardEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { MOMENT_FORMAT } from '@/app/constants';
import { IStockList } from './interfaces/stock.interface';
import { bindPerBagUnitHierarchy, calculateQuantityWithHierarchy, findAndCalculateUnitHierarchy, formatCurrency, getAllUnitHierarchies, getUnitHierarchyByProduct } from '@/app/utils';
import { ITrackInfo } from './interfaces/track.interface';
import { IUnitList } from '../unit/interfaces/unit.interface';

interface Column {
    id: 'stock_code' | 'stock_product' | 'stock_supplier' | 'stock_unit' | 'quantity' | 'buying_price_formatted' | 'selling_price_formatted' | 'total_available' | 'note' | 'created_on';
    label: string;
    minWidth?: number;
    align?: 'right' | 'left';
}

const columns: readonly Column[] = [
    { id: 'stock_code', label: 'Code', minWidth: 100 },
    { id: 'stock_product', label: 'Product', minWidth: 170 },
    {
        id: 'stock_supplier',
        label: 'Supplier',
        minWidth: 170,
        align: 'left',
    },
    {
        id: 'quantity',
        label: 'Quantity',
        minWidth: 100,
        align: 'left',

    },
    {
        id: 'buying_price_formatted',
        label: 'Buying Price',
        minWidth: 170,
        align: 'left',

    },
    {
        id: 'selling_price_formatted',
        label: 'Selling Price',
        minWidth: 170,
        align: 'left',

    },
    {
        id: 'total_available',
        label: 'Available Quantity',
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


export default function Stocks() {
    const searchParams = useSearchParams();

    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0)
    const [perPage, setPerPage] = useState(10);
    const [rows, setRows] = useState<ITrackInfo[]>([]);
    const [totalLength, setTotalLength] = useState(0);
    const showSuccess = searchParams.get('showSuccess');
    const stock = searchParams.get('stock');
    const action = searchParams.get('action');
    const product_id = searchParams.get('product_id');
    const product_info = searchParams.get('product_info');

    const handleChangePage = (event: unknown, newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPerPage(+event.target.value);
        setCurrentPage(0);
    };

    const handleSearch = async (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            await getStocks()
        }
    }

    const getStocks = async () => {
        if (product_id) {
            const unitHierarchy = await getUnitHierarchyByProduct(product_id);
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}stock/getByProduct?product_id=${product_id}&search=${search}&currentPage=${currentPage}&perPage=${perPage}`;
            let response = await fetch(url);
            if (response.ok) {
                let result = await response.json();
                if (result.data) {
                    if (unitHierarchy) {
                        result.data.map((stock: ITrackInfo) => {
                            stock = formatStockData(stock, unitHierarchy)
                        })
                    }

                }
                setRows(result.data);
                setTotalLength(result.totalLength)
            } else {

            }
        } else {
            const unitHierarchies = await getAllUnitHierarchies();
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}stock?search=${search}&currentPage=${currentPage}&perPage=${perPage}`;
            let response = await fetch(url);
            if (response.ok) {
                let result = await response.json();
                result.data.map((stock: ITrackInfo) => {
                    const unitHierarchy = unitHierarchies?.find(x => x.some(y => y.unit_id == stock.stock_unit_id))
                    if (unitHierarchy) {
                        const perBagUnitHierarchy = bindPerBagUnitHierarchy(unitHierarchy, stock.stock_product_per_bag_unit_id, stock.stock_product_per_bag_quantity);
                        stock = formatStockData(stock, perBagUnitHierarchy)
                    }

                })
                setRows(result.data);
                setTotalLength(result.totalLength)
            } else {

            }
        }

    }

    const formatStockData = (stock: ITrackInfo, unitHierarchy?: IUnitList[]) => {
        stock.buying_price_formatted = formatCurrency(parseFloat(stock.buying_price))
        stock.selling_price_formatted = formatCurrency(parseFloat(stock.selling_price))
        stock.total_available = ((parseFloat(stock.total_stored) + parseFloat(stock.total_received)) - (parseFloat(stock.total_sold) + parseFloat(stock.total_transferred))).toString()
        if (unitHierarchy) {
            let formattedQuantity = calculateQuantityWithHierarchy(unitHierarchy, [{ unit_id: stock.stock_unit_id, unit_name: stock.stock_unit, quantity: stock.quantity }])
            let formattedAvailableQuantity = calculateQuantityWithHierarchy(unitHierarchy, [{ unit_id: stock.stock_unit_id, unit_name: stock.stock_unit, quantity: stock.total_available }])
            stock.quantity = formattedQuantity.quantityString;
            stock.total_available = formattedAvailableQuantity.quantityString;
        }
        return stock;
    }

    useEffect(() => {
        getStocks();
    }, [])

    useEffect(() => {
        getStocks()
    }, [currentPage, perPage])

    return (
        <div>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Alert severity='success' hidden={!showSuccess}>{`Stock for ${stock} successfully ${action === 'update' ? 'updated' : 'created'}.`}</Alert>
                <Box sx={{ padding: 2 }}>
                    <div className='flex justify-end pb-5'>
                        <Link href={'/dashboard/stock/create?product_id=' + product_id}>
                            <Button variant='contained' color='primary'>Add Stock</Button>
                        </Link>
                    </div>
                    <Grid container sx={{ paddingTop: '20px' }}>
                        <Grid size={6}>
                            <Typography variant='body1' fontWeight={'bold'}>{`Stocks ${product_id ? ` ( ${product_info} )` : ``}`}</Typography>
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
                <TableContainer sx={{ height: '70vh' }}>

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
                                <TableCell style={{ minWidth: '170px' }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                .map((row, index) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.stock_id}>
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
                                                    <Link href={'/dashboard/stock/create?id=' + row.stock_id + '&product_id=' + (product_id ? product_id : row.stock_product_id)}><IconButton color='default'><EditIcon /></IconButton></Link>
                                                    <Link href={'/dashboard/stock/history?id=' + row.stock_id + '&product_id=' + (product_id ? product_id : row.stock_product_id)}><IconButton color='default'><UpdateIcon /></IconButton></Link>
                                                    <IconButton color='warning'><DeleteIcon /></IconButton>
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
            </Paper>
        </div>

    );
}