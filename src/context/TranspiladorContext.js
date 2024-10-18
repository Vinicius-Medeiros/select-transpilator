import { Alert, Snackbar } from "@mui/material";
import React, { createContext } from "react";

const initialState = {};

export const TranspiladorContext = createContext(initialState);

const TranspiladorContextProvider = props => {
    const [open, setOpen] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [severity, setSeverity] = React.useState("info");

    const [sqlCommand, setSqlCommand] = React.useState("");
    const [error, setError] = React.useState("");
    const [isSqlCommandaValid, setIsSqlCommandValid] = React.useState(false);
    const [sqlCommandParsed, setSqlCommandParsed] = React.useState("");

    const [stringJuncao, setStringJuncao] = React.useState("");
    const [stringReducaoTuplas, setStringReducaoTuplas] = React.useState("");
    const [stringReducaoCampos, setStringReducaoCampos] = React.useState("");

    const [stringAlgebraRelacional, setStringAlgebraRelacional] = React.useState("");

    const showAlert = (message, severity = "info") => {
        setMessage(message);
        setSeverity(severity);
        setOpen(true);
    };

    const hideAlert = () => {
        setOpen(false);
    };

    const value = {
        showAlert,
        sqlCommand,
        setSqlCommand,
        error,
        setError,
        isSqlCommandaValid,
        setIsSqlCommandValid,
        sqlCommandParsed,
        setSqlCommandParsed,
        stringJuncao,
        setStringJuncao,
        stringReducaoTuplas,
        setStringReducaoTuplas,
        stringReducaoCampos,
        setStringReducaoCampos,
        stringAlgebraRelacional,
        setStringAlgebraRelacional,
    };

    const { children } = props;

    return (
        <TranspiladorContext.Provider value={value}>
            {children}
            <Snackbar open={open} autoHideDuration={6000} onClose={hideAlert} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={hideAlert} variant="filled" severity={severity} sx={{ width: "100%" }}>
                    {message}
                </Alert>
            </Snackbar>
        </TranspiladorContext.Provider>
    );
};

export default TranspiladorContextProvider;
