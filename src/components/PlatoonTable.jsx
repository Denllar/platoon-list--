import { Button, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import useGetPlatoonById from "../hooks/useGetPlatoonById"
import useGetStudents from "../hooks/useGetStudents"
import { DataGrid } from "@mui/x-data-grid";
import { useDisclosure } from "@mantine/hooks";
import StudentCreateModal from "./StudentCreateModal";
import { useEffect } from "react";

const columns = [
    {
        field: 'fio',
        headerName: 'ФИО',
        headerAlign: 'center',
        align: 'center',
        flex: 0.3,
        resizable: false,
    },
    {
        field: 'fieldOfStudy',
        headerName: 'Уч. группа',
        type: 'number',
        headerAlign: 'center',
        align: 'center',
        flex: 0.3,
        resizable: false,
        sortable: false
    },
    {
        field: 'status',
        headerName: 'Статус',
        headerAlign: 'center',
        align: 'center',
        flex: 0.3,
        resizable: false,
    },
];

export default function PlatoonTable() {
    const { id: platoonId } = useParams();
    const { data } = useGetPlatoonById(platoonId);

    const { getStudents, students, error, } = useGetStudents();

    const [opened, { open, close }] = useDisclosure(false);

    useEffect(() => {
        getStudents(platoonId);
    }, [platoonId])
    
    return (
        <Stack p={'xs'} style={{ flex: '1', height: '100%' }} bg={'blue'}>
            <Group justify="space-between">
                <Stack c={'white'} gap={0}>
                    <Text>{data?.type}</Text>
                    <Text>Взвод {data?.number}</Text>
                </Stack>

                <Button
                    variant="white"
                    onClick={open}
                >
                    Добавить студента
                </Button>
            </Group>

            <ScrollArea.Autosize>
                <DataGrid
                    rows={students}
                    columns={columns}
                    disableColumnMenu
                    hideFooter
                    sx={{ border: 0 }}
                />
            </ScrollArea.Autosize>

            <StudentCreateModal
                opened={opened}
                close={close}
                platoonId={platoonId}
            />
        </Stack>
    );
}