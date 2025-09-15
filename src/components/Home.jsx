import { useEffect, useMemo } from "react";
import { AppShell, Box, Group } from "@mantine/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import PlatoonList from "./PlatoonList";
import PlatoonTable from "./PlatoonTable";

export default function Home() {
    const localStorageAdapter = useMemo(() => ({
        getItem(name) {
            try {
                return localStorage.getItem(`panel-size:${name}`) || "";
            } catch (error) {
                console.error("LocalStorage error:", error);
                return "";
            }
        },
        setItem(name, value) {
            localStorage.setItem(`panel-size:${name}`, value);
        },
    }), []);

    return (
        <Box style={{ height: "100vh", }}>
            <PanelGroup direction="horizontal" storage={localStorageAdapter} id="main-panels">
                <Panel minSize={20} maxSize={30} defaultSize={25} order={1}>
                    <PlatoonList />
                </Panel>
                <PanelResizeHandle style={{ width: 3, background: 'var(--mantine-color-blue-3)', cursor: 'col-resize' }} />
                <Panel minSize={20} defaultSize={70} order={2}>
                    <PlatoonTable />
                </Panel>
            </PanelGroup>
        </Box>
    );
}