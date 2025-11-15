import { useMemo } from "react";
import { Outlet } from "react-router-dom";
import { AppShell, Box, Group } from "@mantine/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import PlatoonList from "../components/PlatoonList";

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
                <Panel
                    style={{ height: "100%" }}
                    minSize={10}
                    maxSize={30}
                    defaultSize={15}
                    order={1}
                >
                    <PlatoonList />
                </Panel>
                <PanelResizeHandle disabled style={{ width: 3, background: 'var(--mantine-color-blue-3)' }} />
                <Panel minSize={20} defaultSize={70} order={2}>
                    <Outlet/>
                </Panel>
            </PanelGroup>
        </Box>
    );
}