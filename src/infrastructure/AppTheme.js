import { createTheme } from "@mui/material";

export const AppTheme = createTheme({
    palette: {
        primary: {
            main: "#3f51b5",
        },
        secondary: {
            main: "#f50057",
        },
    },
    components: {
        MuiTab: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        color: 'white',
                        backgroundColor: '#3f51b5'
                    }
                }
            }
        }
    }
});
