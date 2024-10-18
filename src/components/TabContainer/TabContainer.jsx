import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tabs } from "@mui/material";
import React from "react";
import ArvoreProjecao from "./Tabs/ArvoreProjecao/ArvoreProjecao";
import { Transpilador } from "./Tabs/Transpilador";
import { tabList, tabListStyle, tabPanelStyle, tabsStyle } from "./constants";

const TabContainer = () => {

	const [value, setValue] = React.useState('1')

	const handleChangeTab = (event, newValue) => {
		setValue(newValue)
	}

	const tabs = [
		{ tabContent: <Transpilador />, value: '1' },
		{ tabContent: <ArvoreProjecao />, value: '2' }
	]

    return (
        <TabContext value={value}>
            <TabList 
				onChange={handleChangeTab}
				sx={tabListStyle}
			>
				{tabList.map(tab => tab.component)}
			</TabList>
			{tabs.map(tab => (
				<TabPanel
					key={'tabPanel - ' + tab.value}
					value={tab.value}
					sx={tabPanelStyle}
				>
					<Tabs
						indicatorColor='white'
						sx={tabsStyle}
						value={false}
					>
						{tab.tabContent}
					</Tabs>
				</TabPanel>
			))}
        </TabContext>
    );
};

export default TabContainer;

