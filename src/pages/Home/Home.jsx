import { Dataset as HashIcon } from "@mui/icons-material";
import { AppBar, Box, Typography } from "@mui/material";
import React from "react";
import TabContainer from "../../components/TabContainer/TabContainer";

const Home = () => {

    return (
        <React.Fragment>
            <AppBar position="static">
                <Typography
                    variant="h2"
                    color="inherit"
                    component="div"
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        backgroundColor: "#000080",
                    }}
                >
                    Processador de Consultas
                    <HashIcon fontSize="large" />
                </Typography>
            </AppBar>
            <Box sx={{ margin: 2 }}>
                <TabContainer />
            </Box>
        </React.Fragment>
    );
};

export default Home;
