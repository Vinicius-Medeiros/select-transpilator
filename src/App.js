import { ThemeProvider } from "@mui/material";
import HashIndexContextProvider from "./context/TranspiladorContext";
import { AppTheme } from "./infrastructure/AppTheme";
import { Home } from "./pages";

const App = () => {
    return (
        <ThemeProvider theme={AppTheme}>
            <HashIndexContextProvider>
                <Home />
            </HashIndexContextProvider>
        </ThemeProvider>
    );
};

export default App;
