import { Button, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import useGetPlatoonById from "../hooks/useGetPlatoonById"
import useGetStudents from "../hooks/useGetStudents"
import { DataGrid } from "@mui/x-data-grid";
import { useDisclosure } from "@mantine/hooks";
import StudentCreateModal from "./StudentCreateModal";
import { useEffect, useState } from "react";

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

    const [students, setStudents] = useState([]);
    const [editStudent, setEditStudent] = useState({});

    const { data } = useGetPlatoonById(platoonId);

    const { getStudents, error, } = useGetStudents({setStudents});
    //getStudents(platoonId);

    const [opened, { open, close }] = useDisclosure(false);

    const onEditStudent = (e) => {
        setEditStudent(e.row);
        open();
    }

    useEffect(() => {
        getStudents(platoonId);
    }, [platoonId]) //getStudents нельзя!!!
    
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
                    onRowClick={onEditStudent}
                    sx={{ border: 0 }}
                />
            </ScrollArea.Autosize>

            <StudentCreateModal
                opened={opened}
                close={close}
                platoonId={platoonId}
                setStudents={setStudents}
                editStudent={editStudent}
                setEditStudent={setEditStudent}
            />
        </Stack>
    );
}