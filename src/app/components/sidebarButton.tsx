import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import { JSX, MouseEventHandler } from "react";

interface SiderbarButtonProps {
    icon: JSX.Element,
    label: string,
    selected: boolean,
    isNested?: boolean,
    isCollapse?: boolean,
    handleClick?: MouseEventHandler
}

function SidebarButton({ icon, label, selected, isNested, isCollapse, handleClick }: SiderbarButtonProps) {
    return (
        <Button onClick={handleClick} sx={{ width: '100%', height: '43px', justifyContent: 'flex-start', fontSize: '13px', borderRadius: '10px', color: selected ? "primary" : "grey" }} variant={selected ? "contained" : "text"} startIcon={icon}>{label} {isNested ? (isCollapse ? <ExpandMoreIcon /> : <ExpandLessIcon />) : <></>}</Button>
    )
}

export default SidebarButton;