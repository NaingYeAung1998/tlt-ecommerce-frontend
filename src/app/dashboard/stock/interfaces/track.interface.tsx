import { IStockRelation, IUnitRelation, IWarehouseRelation } from "@/app/interfaces";
import { IUnitList } from "../../unit/interfaces/unit.interface";
import { IStockList } from "./stock.interface";

export interface ITrackInfo extends IStockList {
    total_delivered: number;
    total_stored: number;
}

export interface ITrack {
    track_id: string;
    stock: IStockRelation;
    warehouse: IWarehouseRelation;
    quantity: string;
    unit: IUnitRelation
    checked_date: string;
    status: string;
    note: string;
    created_on: string;
}

export interface ITrackList extends ITrack {
    warehouse_name: string
}

export type StockTrackProps = {
    stock_id: string
    product_id: string
}

export type AddTrackProps = {
    stock_id: string,
    product_id: string,
    unitHierarchy: IUnitList[]
    handleClose: () => void,
    track_id?: string,
    handleRefresh: () => void
}