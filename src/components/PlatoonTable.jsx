import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button, CloseButton, Dialog, Group, Input, ScrollArea, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataGrid } from "@mui/x-data-grid";
import useGetPlatoonById from "../hooks/useGetPlatoonById"
import useGetStudents from "../hooks/useGetStudents"
import StudentCreateModal from "./StudentCreateModal";
import useDownloadTableWord from "../hooks/useDownloadTableWord";
import useImportPlatoonsWord from "../hooks/useImportPlatoonsWord";
import { STATUS_STUDENT } from "../consts"

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
        flex: 0.5,
        resizable: false,
    },
    {
        field: 'fieldOfStudy',
        headerName: 'Уч. группа',
        type: 'number',
        headerAlign: 'center',
        align: 'center',
        flex: 0.25,
        resizable: false,
        sortable: false
    },
    {
        field: 'status',
        headerName: 'Статус',
        headerAlign: 'center',
        align: 'center',
        flex: 0.25,
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
    const [openedDialog, { toggle: openDialog, close: closeDialog }] = useDisclosure(false);

    const { data } = useGetPlatoonById(platoonId);
    const { getStudents } = useGetStudents({ setStudents });
    const { importFromWord, importStatus } = useImportPlatoonsWord();

    const filteredStudents = useMemo(() => {
        if (!search.trim()) return students;
        const lowerSearch = search.trim().toLowerCase();
        return students.filter(student =>
            student.fio?.toLowerCase().includes(lowerSearch) ||
            student.fieldOfStudy?.toLowerCase().includes(lowerSearch) ||
            student.status?.toLowerCase().includes(lowerSearch)
        );
    }, [students, search]);

    const enrolledStudentsCount = useMemo(() => {
        return filteredStudents.filter(student => student.status === STATUS_STUDENT[0]).length;
    }, [filteredStudents]);

    const { exportToWord } = useDownloadTableWord({ filteredStudents, data });

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
                <Button
                    variant="white"
                    onClick={exportToWord}
                >
                    Скачать в Word
                </Button>
                <Button
                    variant="white"
                    component="label"
                >
                    Импорт из Word
                    <input
                        type="file"
                        hidden
                        accept=".docx"
                        onChange={(e) => {
                            importFromWord(e);
                            openDialog();
                        }}
                    />
                </Button>
            </Group>

            {search && <Text c={'white'} fw={700} size="xl">Поиск по: {search}</Text>}
            {/* {importStatus && <Text c="yellow" fw={700}>{importStatus}</Text>} */}

            <ScrollArea.Autosize>
                <DataGrid
                    rows={filteredStudents}
                    columns={columns}
                    disableColumnMenu
                    hideFooter
                    onRowClick={onEditStudent}
                    disableRowSelectionOnClick
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    sortingOrder={['asc', 'desc']}
                    getRowId={(row) => row.id}
                    getRowClassName={(params) => {
                        if (params.row.status !== STATUS_STUDENT[0]) {
                            return 'not-enrolled';
                        }
                        return params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd';
                    }}
                    sx={{
                        border: 0,
                        '& .even': { backgroundColor: '#f2f2f2' },
                        '& .odd': { backgroundColor: '#ffffff' },
                        '& .not-enrolled': { backgroundColor: '#fa6666' },
                    }}
                />
            </ScrollArea.Autosize>

            <Group justify="flex-end" w="100%">
                <Text c={'white'} size="lg">Кол-во студентов: {enrolledStudentsCount}</Text>
            </Group>

            <StudentCreateModal
                opened={opened}
                close={close}
                platoonId={platoonId}
                setStudents={setStudents}
                editStudent={editStudent}
                setEditStudent={setEditStudent}
            />

            <Dialog opened={openedDialog} withCloseButton onClose={closeDialog} size="lg" radius="md">
                <Text size="sm" mb="xs" fw={500}>
                    {importStatus}
                </Text>
            </Dialog>
        </Stack>
    );
}