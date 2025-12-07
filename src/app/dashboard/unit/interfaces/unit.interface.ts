export interface IUnit {
    unit_id: string
    unit_name: string;
    unit_symbol: string;
    parent_unit?: IUnitPrent | null;
    parent_unit_name: string;
    quantity_per_parent_unit: any;
    created_on: string;
}

export interface IUnitPrent {
    unit_id: string;
}

export interface IUnitList extends IUnit {
    parent_unit?: IUnitListParent
}

export interface IUnitListParent extends IUnitPrent {
    unit_name: string;
    unit_symbol: string
}