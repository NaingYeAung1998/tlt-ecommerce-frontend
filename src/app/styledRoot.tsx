'use client';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import React, { JSX } from 'react';

export function StyledRoot({
    children,
}: React.PropsWithChildren<{}>) {
    return (

        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    );
}