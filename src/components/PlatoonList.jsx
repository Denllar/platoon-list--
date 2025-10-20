import { useEffect, useState } from "react";
import { Menu, Button, Group, ScrollArea, Stack, Text, CloseButton, Input } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { MdModeEdit } from "react-icons/md";
import PlatoonAddModal from "./PlatoonCreateModal";
import { TYPE_PLATOONS } from "../consts";
import useGetPlatoons from "../hooks/useGetPlatoons";

export default function PlatoonList() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [platoons, setPlatoons] = useState([]);
    const [value, setValue] = useState('');
    const [editPlatoon, setEditPlatoon] = useState({});

    const [opened, { open, close }] = useDisclosure(false);

    const { getPlatoons } = useGetPlatoons({ setPlatoons });

    useEffect(() => {
        getPlatoons();
    }, [])

    return (
        <Stack align="center" p={'xs'}>
            <Stack gap={0}>
                <Group
                    justify="space-between"
                >
                    <Text fw={700}>Список взводов</Text>
                    <Button variant="outline" px={'xs'} py={0} onClick={open}>
                        +
                    </Button>
                </Group>

                <Input
                    mb={'xl'}
                    placeholder="Поиск..."
                    value={value}
                    onChange={(event) => setValue(event.currentTarget.value)}
                    rightSectionPointerEvents="all"
                    mt="md"
                    rightSection={
                        <CloseButton
                            onClick={() => setValue('')}
                            style={{ display: value ? undefined : 'none' }}
                        />
                    }
                />

                {value && <Text fw={700} size="xl" mb={'xl'}>Поиск по: {value}</Text>}

                <ScrollArea.Autosize
                    mah="calc(100vh - 150px)"
                    type={"never"}
                >
                    {TYPE_PLATOONS.map((type) => {
                        const platoonsOfType = platoons
                            .filter((platoon) => platoon.type === type)
                            .filter((platoon) => platoon.number.toString().includes(value));
                        if (platoonsOfType.length === 0) return null;
                        return (
                            <Stack align="center" key={type} mb={'xl'}>
                                <Text>{type}</Text>
                                {platoonsOfType.map((platoon) => (
                                    <Group w={'100%'} key={platoon.id}>
                                        <Button
                                            flex={1}
                                            onClick={() => navigate(`${platoon.id}`)}
                                            disabled={platoon.id === id}

                                        >
                                            {platoon.number}
                                        </Button>
                                        {
                                            id === platoon.id &&
                                            <Button
                                                onClick={() => {
                                                    setEditPlatoon(platoon);
                                                    open();
                                                }}
                                            >
                                                <MdModeEdit />
                                            </Button>
                                        }
                                    </Group>
                                ))}
                            </Stack>
                        );
                    })}

                    {TYPE_PLATOONS.every(type => platoons
                        .filter((platoon) => platoon.type === type)
                        .filter((platoon) => platoon.number.toString().includes(value)).length === 0) && (
                            <Text align="center" c="dimmed" mt="md">Взводы не найдены</Text>
                        )}
                </ScrollArea.Autosize>
            </Stack>

            <PlatoonAddModal
                opened={opened}
                close={close}
                setPlatoons={setPlatoons}
                editPlatoon={editPlatoon}
                setEditPlatoon={setEditPlatoon}
            />
        </Stack >
    );
}