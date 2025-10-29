export interface ITrack {
    track_id: string;
    stock: ITrackStock;
    quantity: string;
    checked_date: string;
    status: string;
    note: string;
    created_on: string;
}

export interface ITrackStock {
    stock_id: string
}

export interface ITrackList extends ITrack {

}

export type StockTrackProps = {
    stock_id: string
}

export type AddTrackProps = {
    stock_id: string,
    handleClose: () => void,
    track_id?: string
}