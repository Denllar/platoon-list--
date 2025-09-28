import React, { useState } from "react"
import { Button, CloseButton, Group, Input, Modal, Select, Stack } from "@mantine/core";
import { STATUS_STUDENT, STATUS_STUDENT_KURSANT } from "../consts";
import useAddStudent from "../hooks/useAddStudent";

export default function StudentCreateModal({
    opened,
    close,
    platoonId,
    editPlatoon,
    //setEditPlatoon,
}) {

    const [fio, setFio] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [status, setStatus] = useState(STATUS_STUDENT[0]);

    const { addStudent } = useAddStudent();

    const disabledButtonAdd = !fio || !fieldOfStudy || !status;

    const onCloseModal = () => {
        setFio('');
        setFieldOfStudy('');
        setStatus('');
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
        await addStudent(studentObject);
        onCloseModal();
        window.location.reload();
    }

    return (
        <>
            <Modal
                opened={opened}
                onClose={onCloseModal}
                size={'40%'}
                title={`${editPlatoon?.id ? "Изменить" : "Добавить"} студента`}
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

                    {/* {
                        editPlatoon?.id ?
                            <Button
                                onClick={handleEditPlatoon}
                                disabled={editButtonDisabled}
                            >
                                Изменить
                            </Button> :
                            <Button
                                onClick={addPlatoon}
                                disabled={disabledButtonAdd}
                            >
                                Добавить
                            </Button>
                    } */}
                    <Button
                        onClick={handleAddStudent}
                        disabled={disabledButtonAdd}
                    >
                        Добавить
                    </Button>
                </Stack>
            </Modal>
        </>
    );
}