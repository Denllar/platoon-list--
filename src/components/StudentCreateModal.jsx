import React, { useEffect, useState } from "react"
import { Button, CloseButton, Group, Input, Modal, Select, Stack } from "@mantine/core";
import { STATUS_STUDENT, STATUS_STUDENT_KURSANT } from "../consts";
import useAddStudent from "../hooks/useAddStudent";
import useUpdateStudent from "../hooks/useUpdateStudent";

export default function StudentCreateModal({
    opened,
    close,
    platoonId,
    setStudents,
    editStudent,
    setEditStudent,
}) {
    const [fio, setFio] = useState(editStudent?.fio || '');
    const [fieldOfStudy, setFieldOfStudy] = useState(editStudent?.fieldOfStudy || '');
    const [status, setStatus] = useState(editStudent?.status || STATUS_STUDENT[0]);

    const { addStudent } = useAddStudent();
    const { updateStudent } = useUpdateStudent();

    const disabledButtonAdd = !fio || !fieldOfStudy || !status;
    const editButtonDisabled = disabledButtonAdd || (fio === editStudent.fio && fieldOfStudy === editStudent.fieldOfStudy && status === editStudent.status);

    const onCloseModal = () => {
        setFio('');
        setFieldOfStudy('');
        setEditStudent({})
        close();
    }

    const handleAddStudent = async () => {
        const studentObject = {
            id: Date.now().toString(),
            platoonId,
            fio,
            fieldOfStudy,
            status,
        }
        const { data } = await addStudent(studentObject);
        setStudents(prev => [...prev, data])
        onCloseModal();
    }

    const handleEditStudent = async () => {
        const { data } = await updateStudent(editStudent.id, { fio, fieldOfStudy, status });
        setStudents(prevStudents => prevStudents.map(student => student.id === editStudent.id ? { ...student, ...data } : student))
        onCloseModal();
    }

    useEffect(() => {
        setFio(editStudent?.fio || "");
        setFieldOfStudy(editStudent?.fieldOfStudy || "");
        setStatus(editStudent?.status || STATUS_STUDENT[0]);
    }, [editStudent]);

    return (
        <>
            <Modal
                opened={opened}
                onClose={onCloseModal}
                size={'40%'}
                title={`${editStudent?.id ? "Изменить" : "Добавить"} студента`}
                centered
                closeOnClickOutside={false}
            >
                <Stack>
                    <Input
                        placeholder="ФИО"
                        value={fio}
                        onChange={(e) => setFio(e.target.value)}
                        rightSectionPointerEvents="all"
                        rightSection={
                            <CloseButton
                                onClick={() => setFio("")}
                                style={{ display: fio ? undefined : 'none' }}
                            />
                        }
                    />

                    <Group justify="space-between">
                        <Input
                            placeholder="Уч. группа"
                            value={fieldOfStudy}
                            onChange={(e) => setFieldOfStudy(e.target.value.toUpperCase())}
                            rightSectionPointerEvents="all"
                            rightSection={
                                <CloseButton
                                    onClick={() => setFieldOfStudy("")}
                                    style={{ display: fieldOfStudy ? undefined : 'none' }}
                                />
                            }

                        />

                        <Select
                            placeholder="Статус"
                            data={STATUS_STUDENT}
                            value={status}
                            onChange={setStatus}
                        />
                    </Group>

                    {
                        editStudent?.id ?
                            <Button
                                onClick={handleEditStudent}
                                disabled={editButtonDisabled}
                            >
                                Изменить
                            </Button> :
                            <Button
                                onClick={handleAddStudent}
                                disabled={disabledButtonAdd}
                            >
                                Добавить
                            </Button>
                    }
                </Stack>
            </Modal>
        </>
    );
}