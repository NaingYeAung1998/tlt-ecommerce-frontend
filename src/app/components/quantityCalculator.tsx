import { FC, memo, useEffect, useMemo, useRef, useState } from "react"
import { calculateLowestUnitQuantity, calculateRoundUpUnit } from "../utils"
import { IUnitList } from "../dashboard/unit/interfaces/unit.interface"
import { Box, Button, Modal, TextField, Typography } from "@mui/material"
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material"
import Select from 'react-select'

type QuantiyCalculatorProps = {
    unitHierarchy: IUnitList[],
    parentId: string,
    parentQty: number,
    parentUnitId: string,
    updateParent: (qty: number, unitId: string) => void,
    qtyRef?: React.RefObject<any>,
    nextFocus?: () => void
}

const QuantityCalculator: FC<QuantiyCalculatorProps> = ({ unitHierarchy, parentId, parentQty, parentUnitId, updateParent, qtyRef, nextFocus }) => {

    const [quantityList, setQuantityList] = useState<any[]>([]);
    const [editQuantityModalOpen, setEditQuantityModalOpen] = useState(false);
    const [roundupQuantityString, setRoundupQuantityString] = useState('');
    const qtyInputRef = useRef<any[]>([]);

    useEffect(() => {
        calculateQuantity(true);
    }, [parentId])

    const calculateQuantity = (isParentChanging: boolean) => {
        if ((parentQty && parentQty > 0) || (quantityList.length > 0 && !isParentChanging)) {

            let lowestQty = { quantity: 0, unit_id: '' }
            if (parentQty && parentUnitId && (quantityList.length == 0 || isParentChanging)) {
                lowestQty = { quantity: parentQty, unit_id: parentUnitId }
            } else {
                lowestQty = calculateLowestUnitQuantity(unitHierarchy, quantityList)
            }

            let roundupQuantityString = "";
            let roundupQuantityList: any[] = [];
            let roundupQuantity = calculateRoundUpUnit(unitHierarchy, lowestQty.quantity);

            roundupQuantity.forEach((qty, index) => {
                roundupQuantityString += `${qty.quantity} ${qty.unit_name} `;
                roundupQuantityList.push({ id: (index + 1).toString(), quantity: qty.quantity, unit_id: qty.unit_id, unit_name: qty.unit_name, unit: { value: qty.unit_id, label: qty.unit_name } })
            })

            setRoundupQuantityString(roundupQuantityString)
            setQuantityList(roundupQuantityList)
            updateParent(lowestQty.quantity, lowestQty.unit_id)
        } else {
            setRoundupQuantityString("")
            updateParent(0, parentUnitId)
        }
    }

    const handleEditQuantityModalClose = () => {
        setEditQuantityModalOpen(false);
    }

    const handleQuantityChange = (quantity: any, id: string) => {
        let qtyList = [...quantityList];
        let qty = qtyList.find(x => x.id == id);
        if (qty) {
            let index = qtyList.indexOf(qty);
            qtyList[index].quantity = quantity;
            setQuantityList(qtyList)
        }
    }

    const handleQuantityUnitChange = (option: any, id: string) => {
        let qtyList = [...quantityList];
        let qty = qtyList.find(x => x.id == id);
        if (qty) {
            let index = qtyList.indexOf(qty);
            qtyList[index].unit_id = option.value;
            qtyList[index].unit_name = option.label;
            qtyList[index].unit = option
            setQuantityList(qtyList);
        }
    }

    const handleAddQuanttiy = () => {
        let qtyList = [...quantityList];
        qtyList.push({ id: (qtyList.length + 1).toString(), quantity: 0, option: null });
        setQuantityList(qtyList)
        setTimeout(() => {
            if (qtyInputRef && qtyInputRef.current[qtyList.length - 1]) {
                qtyInputRef.current[qtyList.length - 1].focus();
                qtyInputRef.current[qtyList.length - 1].select();
            }
        }, 50)
    }

    const handleDeleteQuantity = (id: string) => {
        setQuantityList((prev: any) => prev.filter((x: any) => x.id != id));
    }

    const handleSaveEditQuantityModal = () => {
        calculateQuantity(false)
        setEditQuantityModalOpen(false);
        if (nextFocus) {
            nextFocus()
        }

    }

    const openModal = () => {
        setEditQuantityModalOpen(true);
        handleAddQuanttiy();
    }

    const unitList = useMemo(() => unitHierarchy.map((unit) => { return { label: unit.unit_name, value: unit.unit_id } }), [unitHierarchy])

    return (
        <>
            <div className="flex gap-3">
                <TextField type="text" InputLabelProps={{ shrink: !!roundupQuantityString }} value={roundupQuantityString} variant="outlined" label="Quantity" sx={{ width: { xs: '100%', lg: '100%' }, zIndex: 0 }} />
                <Button ref={qtyRef} variant="outlined" onClick={() => openModal()}><EditIcon /></Button>
            </div>

            <Modal open={editQuantityModalOpen} onClose={handleEditQuantityModalClose}>
                <div className='flex items-center justify-center mt-[20vh]'>
                    <Box sx={{ padding: 5, flexDirection: 'column', backgroundColor: 'white', borderRadius: '10px', width: { md: '40%' } }}>
                        <br />
                        <div className="flex justify-between items-center pb-[30px]">
                            <Typography variant="body1" fontWeight={'bold'}>Quantities</Typography>
                            <Button variant="outlined" onClick={() => handleAddQuanttiy()}>Add Quantity</Button>
                        </div>

                        {
                            quantityList.map((qty: any, index: number) =>
                                <div className="md:flex gap-4 pb-[30px]" key={index}>
                                    <div className="md:w-[40%]">
                                        <TextField inputRef={(ref) => qtyInputRef.current[index] = ref} type="number" value={qty.quantity} label="Quantity" onChange={(e) => handleQuantityChange(e.target.value, qty.id)} />
                                    </div>
                                    <div className="md:w-[45%]">
                                        <Select options={unitList} placeholder='Units' styles={{
                                            control: (styles) => ({ ...styles, width: '100%', height: '55px' }),
                                            menu: (styles) => ({ ...styles, width: '100%' }),
                                            menuPortal: (styles) => ({ ...styles, zIndex: 1, width: '100%' })
                                        }}
                                            value={qty.unit}
                                            onChange={(option) => handleQuantityUnitChange(option, qty.id)}
                                        />
                                    </div>
                                    <div className="md:w-[15%]">
                                        <Button variant="outlined" sx={{ height: '55px' }} onClick={() => handleDeleteQuantity(qty.id)}><DeleteIcon /></Button>
                                    </div>
                                </div>
                            )
                        }

                        <div className="flex justify-end pt-[20px] gap-4">
                            <Button variant="contained" onClick={() => handleSaveEditQuantityModal()}>Close</Button>
                        </div>
                    </Box>
                </div>
            </Modal>
        </>
    )
}

export default QuantityCalculator