import { useEffect, useState } from "react";
import { Menu, Button, Group, ScrollArea, Stack, Text, CloseButton, Input, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { MdModeEdit } from "react-icons/md";
import { CiViewTable } from "react-icons/ci";
import { CiSettings } from "react-icons/ci";
import { FaBoxArchive } from "react-icons/fa6";
import PlatoonAddModal from "./PlatoonCreateModal";
import { TYPE_PLATOONS } from "../consts";
import useGetPlatoons from "../hooks/useGetPlatoons";
import DrawerTable from "./DrawerTable";
import useGetStudents from "../hooks/useGetStudents";
import SettingsModal from "./SettingsModal";
import useDeleteAllArchivePlatoons from "../hooks/useDeleteAllArchivePlatoons";

export default function PlatoonList() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [platoons, setPlatoons] = useState([]);
    const [students, setStudents] = useState([]);
    const [value, setValue] = useState('');
    const [editPlatoon, setEditPlatoon] = useState({});
    const [showOnlyArchive, setShowOnlyArchive] = useState(false);

    const [openedModal, modal] = useDisclosure(false);
    const [openedModalSettings, modalSettings] = useDisclosure(false);
    const [openedDrawer, drawer] = useDisclosure(false);

    const { getPlatoons } = useGetPlatoons({ setPlatoons });
    const { getStudents } = useGetStudents({ setStudents });
    const { deleteAllArchivePlatoon } = useDeleteAllArchivePlatoons();

    const clearArchivedPlatoons = async () => {
        if (confirm("Вы уверены, что хотите очистить архив?")) {
            await deleteAllArchivePlatoon();
            window.location.reload();
        }
    }

    useEffect(() => {
        getPlatoons();
        getStudents();
    }, [])

    return (
        <Stack align="center" p={'xs'}>
            <Stack gap={0}>
                <Text fw={700} size="xl" mb={'md'}>Контингент обучающихся</Text>
                <Group
                    justify="space-between"
                    mb={'md'}
                    grow
                >
                    <Button
                        variant="outline"
                        onClick={drawer.open}
                    >
                        <CiViewTable />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={modalSettings.open}
                    >
                        <CiSettings />
                    </Button>
                    <Button
                        variant={showOnlyArchive ? "filled" : "outline"}
                        onClick={() => setShowOnlyArchive((prev) => !prev)}
                    >
                        <FaBoxArchive />
                    </Button>
                </Group>

                <Group
                    align="center"
                    mb={'xl'}
                >
                    <Input
                        placeholder="Поиск..."
                        value={value}
                        onChange={(event) => setValue(event.currentTarget.value)}
                        rightSectionPointerEvents="all"
                        rightSection={
                            <CloseButton
                                onClick={() => setValue('')}
                                style={{ display: value ? undefined : 'none' }}
                            />
                        }
                    />
                    <Button variant="outline" onClick={modal.open}>
                        +
                    </Button>
                </Group>

                {showOnlyArchive &&
                    <Group mb={'xl'}>
                        <Text fw={700} size="40px">Архив</Text>
                        <Button
                            onClick={clearArchivedPlatoons}
                            color={showOnlyArchive && 'orange'}
                        >
                            Очистить архив
                        </Button>
                    </Group>
                }

                {value && <Text fw={700} size="xl" mb={'xl'}>Поиск по: {value}</Text>}

                <ScrollArea.Autosize
                    mah="calc(90vh - 150px)"
                    type={"never"}
                >
                    {TYPE_PLATOONS.map((type) => {
                        const platoonsOfType = platoons
                            .filter((platoon) => platoon.type === type)
                            .filter((platoon) => {
                                const lowerValue = value.toLowerCase();
                                const numberMatch = platoon.number.toString().includes(value);
                                const officerMatch = platoon.officer?.toLowerCase().includes(lowerValue);
                                const studentsOfPlatoon = students.filter(s => s.platoonId === platoon.id);
                                const studentMatch = studentsOfPlatoon.some(s => s.fio.toLowerCase().includes(lowerValue));
                                return numberMatch || officerMatch || studentMatch;
                            })
                            .filter((platoon) => showOnlyArchive ? platoon.isInArchive === true : !platoon.isInArchive)
                            .sort((a, b) => a.number - b.number);
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
                                            color={showOnlyArchive && 'orange'}
                                        >
                                            {platoon.number}
                                        </Button>
                                        {
                                            id === platoon.id &&
                                            <Button
                                                onClick={() => {
                                                    setEditPlatoon(platoon);
                                                    modal.open();
                                                }}
                                                color={showOnlyArchive && 'orange'}
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
                opened={openedModal}
                close={modal.close}
                setPlatoons={setPlatoons}
                editPlatoon={editPlatoon}
                setEditPlatoon={setEditPlatoon}
                showOnlyArchive={showOnlyArchive}
            />

            <SettingsModal
                opened={openedModalSettings}
                close={modalSettings.close}
                quantityPlatoons={platoons.length}
            />

            <DrawerTable
                openedDrawer={openedDrawer}
                drawer={drawer}
                platoons={platoons}
                students={students}
            />
        </Stack >
    );
}