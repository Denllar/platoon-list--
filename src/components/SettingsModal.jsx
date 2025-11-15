import { Dialog, Button, Group, Input, Modal, Select, Stack, Text, CloseButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { FaTrash } from "react-icons/fa"
import useDeleteAllPlatoons from "../hooks/useDeleteAllPlatoons";
import { useNavigate } from "react-router-dom";

export default function SettingsModal({
    opened,
    close,
    quantityPlatoons,
}) {
    const navigate = useNavigate();

    const [deleteInput, setDeleteInput] = useState("");
    const [deleteError, setDeleteError] = useState("");
    //const [openedDialog, { toggle: openDialog, close: closeDialog }] = useDisclosure(false);
    const [openedConfirmDeleteModal, confirmDeleteModal] = useDisclosure(false);

    const { deleteAllPlatoon } = useDeleteAllPlatoons();
    
    const confirmDeleteData = async () => {
        if (deleteInput == quantityPlatoons) {
            await deleteAllPlatoon();
            window.location.reload();
            navigate('/')
        } else {
            setDeleteError('Неверно введёно кол-во взводов. Удаление данных отменено.');
        }
    }

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                size={'40%'}
                title={"Настройки"}
                centered
                closeOnClickOutside={false}
            >
                <Stack>
                    <Group justify="space-between">
                        <Text>Удалить все взвода и студентов в них</Text>
                        <Button
                            onClick={confirmDeleteModal.open}
                            disabled={quantityPlatoons===0}
                        >
                            <FaTrash />
                        </Button>
                    </Group>

                    <Group grow>

                    </Group>
                </Stack>
            </Modal>

            {/* Модальное окно удаления взвода */}
            <Modal opened={openedConfirmDeleteModal} onClose={confirmDeleteModal.close} centered title="Удалить все данные?" size="md">
                <Stack>
                    <Text>Для подтверждения удаления введите кол-во взводов: <b>{quantityPlatoons}</b></Text>
                    <Input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="Введите кол-во взводов..." />
                    {deleteError && <Text c="red" size="sm">{deleteError}</Text>}
                    <Group justify="flex-end">
                        <Button onClick={confirmDeleteModal.close} variant="default">Отменить</Button>
                        <Button onClick={confirmDeleteData} color="red">Удалить</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* <Dialog opened={openedDialog} withCloseButton onClose={closeDialog} size="lg" radius="md">
                <Text size="sm" mb="xs" fw={500}>
                    Все данные успешно удалены!
                </Text>
            </Dialog> */}
        </>
    );
}