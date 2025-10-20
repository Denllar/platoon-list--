import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button, CloseButton, Group, Input, ScrollArea, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataGrid } from "@mui/x-data-grid";
import useGetPlatoonById from "../hooks/useGetPlatoonById"
import useGetStudents from "../hooks/useGetStudents"
import StudentCreateModal from "./StudentCreateModal";

const columns = [
    {
        field: 'order',
        headerName: '№',
        width: 60,
        headerAlign: 'center',
        align: 'center',
        resizable: false,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            // Получаем все ID строк в текущем порядке
            const allRowIds = params.api.getAllRowIds();
            // Находим индекс текущей строки и добавляем 1 (так как индексация с 0)
            return allRowIds.indexOf(params.id) + 1;
        }
    },
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
    const [search, setSearch] = useState('');
    const [sortModel, setSortModel] = useState([{ field: 'fio', sort: 'asc' }]);

    const [opened, { open, close }] = useDisclosure(false);

    const { data } = useGetPlatoonById(platoonId);
    const { getStudents, error, } = useGetStudents({ setStudents });

    const filteredStudents = useMemo(() => {
        if (!search.trim()) return students;
        const lowerSearch = search.trim().toLowerCase();
        return students.filter(student =>
            student.fio?.toLowerCase().includes(lowerSearch) ||
            student.fieldOfStudy?.toLowerCase().includes(lowerSearch) ||
            student.status?.toLowerCase().includes(lowerSearch)
        );
    }, [students, search]);

    const onEditStudent = (e) => {
        setEditStudent(e.row);
        open();
    }

    useEffect(() => {
        getStudents(platoonId);
        setSortModel([{ field: 'fio', sort: 'asc' }]);
    }, [platoonId]) //getStudents нельзя!!!

    return (
        <Stack p={'xs'} style={{ flex: '1', height: '100%' }} bg={'blue'}>
            <Group gap={'xl'}>
                <Stack c={'white'} gap={0}>
                    <Text fw={700}>{data?.type}</Text>
                    <Text fw={700}>Взвод {data?.number}</Text>
                </Stack>

                <Input
                    placeholder="Поиск..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    rightSectionPointerEvents="all"
                    style={{ flex: 1 }}
                    rightSection={
                        <CloseButton
                            onClick={() => setSearch("")}
                            style={{ display: search ? undefined : 'none' }}
                        />
                    }
                />

                <Button
                    variant="white"
                    onClick={open}
                >
                    Добавить студента
                </Button>
            </Group>

            {search && <Text c={'white'} fw={700} size="xl">Поиск по {search}</Text>}

            <ScrollArea.Autosize>
                <DataGrid
                    rows={filteredStudents}
                    columns={columns}
                    disableColumnMenu
                    hideFooter
                    onRowClick={onEditStudent}
                    sx={{ border: 0 }}
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    sortingOrder={['asc', 'desc']}
                    getRowId={(row) => row.id}
                    getRowClassName={(params) =>
                        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                    }
                    sx={{
                        '& .even': { backgroundColor: '#f2f2f2' },
                        '& .odd': { backgroundColor: '#ffffff' },
                    }}
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