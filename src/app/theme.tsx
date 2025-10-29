'use client';
import { Poppins, Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const poppins = Poppins({
    weight: ['300', '400', '500', '700'],
    variable: "--font-poppins",
    subsets: ["latin"],
});

const theme = createTheme({
    palette: {
        primary: {
            light: '#A22C29',
            main: '#A22C29',
            dark: '#A22C29',
            contrastText: '#fff',
        },
        secondary: {
            light: '#D6D5C9',
            main: '#D6D5C9',
            dark: '#D6D5C9',
            contrastText: '#000',
        },
    },
    typography: {
        fontFamily: poppins.style.fontFamily,
    },
});

export default theme;