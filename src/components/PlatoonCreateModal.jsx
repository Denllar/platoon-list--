import { useEffect, useState } from "react";
import { Dialog, Button, Group, Input, Modal, Select, Stack, Text, CloseButton } from "@mantine/core";
import { TYPE_PLATOONS } from "../consts";
import { useDisclosure } from "@mantine/hooks";
import useAddPlatoon from "../hooks/useAddPlatoon";
import useUpdatePlatoon from "../hooks/useUpdatePlatoon";
import { useNavigate } from "react-router-dom";
import useDeletePlatoon from "../hooks/useDeletePlatoon";

export default function PlatoonCreateModal({
    opened,
    close,
    setPlatoons,
    editPlatoon,
    setEditPlatoon,
    showOnlyArchive,
}) {
    const navigate = useNavigate();

    const [openedDialog, { toggle: openDialog, close: closeDialog }] = useDisclosure(false);
    const [typePlatoon, setTypePlatoon] = useState(editPlatoon.type || "");
    const [numberPlatoon, setNumberPlatoon] = useState(editPlatoon.number || "");
    const disabledButtonAdd = !typePlatoon || !numberPlatoon;
    const editButtonDisabled = disabledButtonAdd || (typePlatoon === editPlatoon.type && numberPlatoon === editPlatoon.number);

    const { createPlatoon } = useAddPlatoon();
    const { updatePlatoon } = useUpdatePlatoon();
    const { deletePlatoon } = useDeletePlatoon();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const onCloseModal = () => {
        setTypePlatoon("");
        setNumberPlatoon("");
        setEditPlatoon({});
        close();
    }

    const addPlatoon = async () => {
        const platoonObject = {
            id: Date.now().toString(),
            type: typePlatoon,
            number: numberPlatoon,
            isInArchive: false,
        }
        const { data, error: addError } = await createPlatoon(platoonObject);
        if (addError) {
            openDialog();
            return;
        }
        setPlatoons(prev => [...prev, data]);
        onCloseModal();
        navigate(`/${platoonObject.id}`)
    }

    const handleEditPlatoon = async () => {
        const { data } = await updatePlatoon(editPlatoon.id, { type: typePlatoon, number: numberPlatoon });
        //setPlatoons(prevPlatoons => prevPlatoons.map(platoon => platoon.id === editPlatoon.id ? { ...platoon, ...data } : platoon))
        onCloseModal();
        window.location.reload()
    }

    const handleDeletePlatoon = () => {
        setDeleteInput("");
        setDeleteError("");
        setShowDeleteModal(true);
    }

    const confirmDeletePlatoon = async () => {
        if (deleteInput === String(editPlatoon.number)) {
            await updatePlatoon(editPlatoon.id, { type: typePlatoon, number: numberPlatoon, isInArchive: true });
            setPlatoons(prevPlatoons => prevPlatoons.filter(platoon => platoon.id !== editPlatoon.id))
            setShowDeleteModal(false);
            onCloseModal();
            navigate('/')
            window.location.reload();
        } else {
            setDeleteError('Неверно введён номер взвода. Удаление отменено.');
        }
    }
    const cancelDeletePlatoon = () => {
        setShowDeleteModal(false);
        setDeleteInput("");
        setDeleteError("");
    }

    useEffect(() => {
        setTypePlatoon(editPlatoon?.type || "");
        setNumberPlatoon(editPlatoon?.number || "");
    }, [editPlatoon]);

    return (
        <>
            <Modal
                opened={opened}
                onClose={onCloseModal}
                size={'40%'}
                title={`${editPlatoon?.id ? "Изменить" : "Добавить"} взвод`}
                centered
                closeOnClickOutside={false}
            >
                <Stack>
                    <Group justify="space-between">
                        <Select
                            placeholder="Тип взвода"
                            data={TYPE_PLATOONS}
                            defaultValue={''}
                            value={typePlatoon}
                            onChange={setTypePlatoon}
                        />
                        <Input
                            placeholder="Номер взвода"
                            value={numberPlatoon}
                            onChange={(e) => setNumberPlatoon(e.target.value)}
                            rightSectionPointerEvents="all"
                            rightSection={
                                <CloseButton
                                    onClick={() => setNumberPlatoon("")}
                                    style={{ display: numberPlatoon ? undefined : 'none' }}
                                />
                            }
                        />
                    </Group>

                    <Group grow>
                        {
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
                        }

                        {
                            editPlatoon?.id && !showOnlyArchive &&
                            <Button
                                onClick={handleDeletePlatoon}
                                variant="outline"
                            >
                                Удалить
                            </Button>
                        }

                        {
                            showOnlyArchive &&
                            <Button
                                onClick={async () => {
                                    await deletePlatoon(editPlatoon.id);
                                    window.location.reload();
                                }}
                                variant="outline"
                            >
                                Удалить с архива
                            </Button>
                        }

                        {
                            showOnlyArchive &&
                            <Button
                                onClick={async () => {
                                    await updatePlatoon(editPlatoon.id, { type: typePlatoon, number: numberPlatoon, isInArchive: false });
                                    window.location.reload();
                                }}
                                variant="outline"
                            >
                                Вернуть
                            </Button>
                        }
                    </Group>
                </Stack>
            </Modal>

            {/* Модальное окно удаления взвода */}
            <Modal opened={showDeleteModal} onClose={cancelDeletePlatoon} centered title="Удалить взвод?" size="md">
                <Stack>
                    <Text>Для подтверждения удаления введите номер взвода: <b>{editPlatoon.number}</b></Text>
                    <Input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="Введите номер взвода..." />
                    {deleteError && <Text color="red" size="sm">{deleteError}</Text>}
                    <Group justify="flex-end">
                        <Button onClick={cancelDeletePlatoon} variant="default">Отменить</Button>
                        <Button onClick={confirmDeletePlatoon} color="red">Удалить</Button>
                    </Group>
                </Stack>
            </Modal>

            <Dialog opened={openedDialog} withCloseButton onClose={closeDialog} size="lg" radius="md">
                <Text size="sm" mb="xs" fw={500}>
                    Ошибка, такой взвод уже существует!
                </Text>
            </Dialog>
        </>
    );
}