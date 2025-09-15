import { useEffect, useState } from "react";
import { Menu, Button, Group, ScrollArea, Stack, Text } from "@mantine/core";
import PlatoonAddModal from "./PlatoonCreateModal";
import { useDisclosure } from "@mantine/hooks";
import { TYPE_PLATOONS } from "../consts";

export default function PlatoonList() {
    const [platoons, setPlatoons] = useState([]);
    const [opened, { open, close }] = useDisclosure(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await window.electronAPI.getAllData();
            setPlatoons(data);
        }
        fetchData();
    }, [])

    return (
        <Stack align="center" p={'xs'}>
            <ScrollArea>
                <Group mb={'xl'}>
                    <Text fw={700}>Список взводов</Text>
                    <Button variant="outline" px={'xs'} py={0} onClick={open}>
                        +
                    </Button>
                    <PlatoonAddModal
                        opened={opened}
                        close={close}
                    />
                </Group>

                <Stack>
                    {TYPE_PLATOONS.map((type) => {
                        const platoonsOfType = platoons.filter((platoon) => platoon.type === type);
                        if (platoonsOfType.length === 0) return null;
                        return (
                            <Stack align="center" key={type}>
                                <Text>{type}</Text>
                                {platoonsOfType.map((platoon) => (
                                    <Button
                                        key={platoon.id}
                                        w={'100%'}
                                    >
                                        {platoon.number}
                                    </Button>
                                ))}
                            </Stack>
                        );
                    })}
                </Stack>
            </ScrollArea>
        </Stack>
    );
}