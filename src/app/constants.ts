import { ISelect } from "./interfaces"

export const MOMENT_FORMAT = 'MMMM Do YYYY, h:mm:ss a'

export const TRACK_STATUS_LIST: ISelect[] = [
    {
        label: 'Delivered',
        value: '0'
    },
    {
        label: 'Stored',
        value: '1'
    }
]