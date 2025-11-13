import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { FC } from "react";

interface DeleteConfirmDialogProps {
    title?: string,
    open: boolean,
    handleClose: () => void,
    handleDelete: () => void
}

const DeleteConfirmDialog: FC<DeleteConfirmDialogProps> = ({ title, open, handleClose, handleDelete }) => {
    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete Confirmation"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {
                            `Are you sure you want to delete ${title}?`
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" color="warning" onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleDelete}> Confirm </Button>
                </DialogActions>
            </Dialog></>
    )
}

export default DeleteConfirmDialog;