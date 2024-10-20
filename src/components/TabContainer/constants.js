import { Tab } from "@mui/material";

export const tabListStyle = {
    "& .MuiTabs-flexContainer": {
        width: "100%",
        gap: "20px",
        backgroundColor: "white",
    },
    "& .MuiButtonBase-root": {
        backgroundColor: "white",
        flexGrow: 1,
        maxWidth: "none",
        height: "65px",
        borderTop: "2px solid #3f51b5",
        borderRight: "2px solid #3f51b5",
        borderLeft: "2px solid #3f51b5",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
    },
};

export const tabPanelStyle = {
    padding: 0,
    padding: 2,
    backgroundColor: "white",
    border: "none",
    border: "1px solid #3f51b5",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
};

export const tabsStyle = {
    ".MuiTabs-flexContainer": {
        flexDirection: "column",
    },
};

export const tabList = [
    { component: <Tab label="Transpilar comando SQL" key="tab - 1" value="1" /> }, 
    { component: <Tab label="Arvoré de Projeção - Ordem de Execução" key="tab - 2" value="2" /> }
];
