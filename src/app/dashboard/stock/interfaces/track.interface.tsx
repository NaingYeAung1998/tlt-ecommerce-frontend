import { IStockList } from "./stock.interface";

export interface ITrackList extends IStockList {
    warehouse_name: string;
    total_delivered: number;
    total_stored: number;
}

export interface ITrack {
    track_id: string;
    stock: ITrackStock;
    warehouse: ITrackWarehouse;
    quantity: string;
    checked_date: string;
    status: string;
    note: string;
    created_on: string;
}

export interface ITrackStock {
    stock_id: string
}

export interface ITrackWarehouse {
    warehouse_id: string
}

export interface ITrackList extends ITrack {

}

export type StockTrackProps = {
    stock_id: string
}

export type AddTrackProps = {
    stock_id: string,
    handleClose: () => void,
    track_id?: string,
    handleRefresh: () => void
}