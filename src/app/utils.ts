import { useMemo } from "react";
import { IUnitList } from "./dashboard/unit/interfaces/unit.interface";

export const formatCurrency = (amount: number) => {
    let nfObject = new Intl.NumberFormat('en-US');
    return nfObject.format(amount) + " MMK"
}

export const calculateRoundUpUnit = (hierarchy: IUnitList[], lowestQty: number) => {
    let roundupUnits = [];
    let currentUnitQuantity = lowestQty
    let currentHierarchy = [...hierarchy];
    currentHierarchy.reverse();
    for (let i = 0; i < currentHierarchy.length; i++) {
        let unit = currentHierarchy[i];
        if (unit.parent_unit) {

            let upperUnitQuantity = Math.floor(currentUnitQuantity / unit.quantity_per_parent_unit);
            let currentUnitRemainderQuantity = currentUnitQuantity % unit.quantity_per_parent_unit;
            if (currentUnitRemainderQuantity > 0) {
                roundupUnits.unshift({ unit_id: unit.unit_id, unit_name: unit.unit_name, quantity: currentUnitRemainderQuantity })
            }
            if (upperUnitQuantity > 0) {
                currentUnitQuantity = upperUnitQuantity;
            } else {
                break;
            }
        } else {
            roundupUnits.unshift({ unit_id: unit.unit_id, unit_name: unit.unit_name, quantity: currentUnitQuantity })
        }
    }
    return roundupUnits;

};

export const calculateLowestUnitQuantity = (hierarchy: IUnitList[], quantityList: any[]) => {
    let currentUnitQuantity = 0;
    let lastUnitId = "";
    let lastUnitName = "";
    for (let i = 0; i < hierarchy.length; i++) {
        let unit = hierarchy[i];
        // skip the first unit which does not have quantity_per_parent_unit
        if (i > 0) {
            currentUnitQuantity *= parseFloat(unit.quantity_per_parent_unit);
        }
        let unitQuantites = quantityList.filter(x => x.unit_id == unit.unit_id);
        unitQuantites.forEach((qty) => {
            currentUnitQuantity += parseFloat(qty.quantity);
        });

        // for lowest unit
        if (i == hierarchy.length - 1) {
            lastUnitId = unit.unit_id;
            lastUnitName = unit.unit_name;
        }
    }

    return { unit_id: lastUnitId, unit_name: lastUnitName, quantity: currentUnitQuantity }
}

export const calculateQuantityWithProduct = async (productId: string, quantityList: any[]) => {
    let unitHierarchy = await getUnitHierarchyByProduct(productId);
    if (unitHierarchy) {
        return calculateQuantityWithHierarchy(unitHierarchy, quantityList);
    }
}

export const calculateQuantityWithHierarchy = (unitHierarchy: IUnitList[], quantityList: any[]) => {
    let lowestQty = calculateLowestUnitQuantity(unitHierarchy, quantityList)
    let roundupQuantityString = "";
    let roundupQuantityList: any[] = [];
    let roundupQuantity = calculateRoundUpUnit(unitHierarchy, lowestQty.quantity);

    roundupQuantity.forEach((qty) => {
        roundupQuantityString += `${qty.quantity} ${qty.unit_name} `;
        roundupQuantityList.push({ id: qty.unit_id, quantity: qty.quantity, unit_id: qty.unit_id, unit_name: qty.unit_name, unit: { value: qty.unit_id, label: qty.unit_name } })
    })
    roundupQuantityString = roundupQuantityString != "" ? roundupQuantityString : "0"
    return { quantityList: roundupQuantityList, quantityString: roundupQuantityString, unitHierarchy };
}

export const getUnitHierarchyByProduct = async (product_id: string) => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + "product/getProductUnitHierarchy/" + product_id
    let response = await fetch(url);
    if (response.ok) {
        let result: IUnitList[] = await response.json();
        return result
    }
}

export const getAllUnitHierarchies = async () => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + "unit/getUnitHierarchies";
    let response = await fetch(url);
    if (response.ok) {
        let result: IUnitList[][] = await response.json();
        return result;
    }
}

export const findAndCalculateUnitHierarchy = (hierarchies: IUnitList[][], unit_id: string, qunatityList: any[], per_bag_unit_id: string, per_bag_unit_qunatity: string) => {
    let unitHierarchy = hierarchies.find(x => x.some(y => y.unit_id == unit_id));
    if (unitHierarchy) {
        // let bagUnit = { unit_id: process.env.NEXT_PUBLIC_BAG_UNIT_ID ?? '', unit_name: process.env.NEXT_PUBLIC_BAG_UNIT_NAME ?? '', unit_symbol: process.env.NEXT_PUBLIC_BAG_UNIT_NAME ?? '' }
        // let bagConnectedUnitIndex = unitHierarchy.findIndex(x => x.unit_id == per_bag_unit_id);
        // if (bagConnectedUnitIndex >= 0) {
        //     unitHierarchy[bagConnectedUnitIndex].parent_unit = bagUnit;
        //     unitHierarchy[bagConnectedUnitIndex].quantity_per_parent_unit = per_bag_unit_qunatity;
        //     unitHierarchy.splice(0, bagConnectedUnitIndex);
        //     unitHierarchy.unshift(bagUnit);
        // }
        // return calculateQuantityWithHierarchy(unitHierarchy, qunatityList);
        return bindAndCalculatePerBagUnitHierarchy(unitHierarchy, qunatityList, per_bag_unit_id, per_bag_unit_qunatity);
    }
}

export const bindAndCalculatePerBagUnitHierarchy = (unitHierarchy: IUnitList[], qunatityList: any[], per_bag_unit_id: string, per_bag_unit_qunatity: string) => {
    unitHierarchy = bindPerBagUnitHierarchy(unitHierarchy, per_bag_unit_id, per_bag_unit_qunatity)
    return calculateQuantityWithHierarchy(unitHierarchy, qunatityList);
}

export const bindPerBagUnitHierarchy = (unitHierarchy: IUnitList[], per_bag_unit_id: string, per_bag_unit_qunatity: string) => {
    let bagUnit = { unit_id: process.env.NEXT_PUBLIC_BAG_UNIT_ID ?? '', unit_name: process.env.NEXT_PUBLIC_BAG_UNIT_NAME ?? '', unit_symbol: process.env.NEXT_PUBLIC_BAG_UNIT_NAME ?? '' }
    let bagConnectedUnitIndex = unitHierarchy.findIndex(x => x.unit_id == per_bag_unit_id);
    if (bagConnectedUnitIndex >= 0) {
        unitHierarchy[bagConnectedUnitIndex].parent_unit = bagUnit;
        unitHierarchy[bagConnectedUnitIndex].quantity_per_parent_unit = per_bag_unit_qunatity;
        unitHierarchy.splice(0, bagConnectedUnitIndex);
        unitHierarchy.unshift(bagUnit);
    }
    return unitHierarchy;
}

export const handleNextFocus = (e: any, nextRef: React.RefObject<HTMLInputElement | null>) => {
    if (e.key === 'Enter') {
        if (nextRef && nextRef.current) {
            nextRef.current.focus();
        }
    }
}