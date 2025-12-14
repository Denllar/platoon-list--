import { Dialog, Button, Group, Input, Modal, Select, Stack, Text, CloseButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { FaTrash } from "react-icons/fa"
import { FaArrowUp } from "react-icons/fa";
import useDeleteAllPlatoons from "../hooks/useDeleteAllPlatoons";
import { useNavigate } from "react-router-dom";
import useTransferToTheNextYear from "../hooks/useTransferToTheNextYear";

export default function SettingsModal({
    opened,
    close,
    quantityPlatoons,
}) {
    const navigate = useNavigate();

    const [deleteInput, setDeleteInput] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [transferError, setTransferError] = useState("");
    const [transferLoading, setTransferLoading] = useState(false);
    //const [openedDialog, { toggle: openDialog, close: closeDialog }] = useDisclosure(false);
    const [openedConfirmDeleteModal, confirmDeleteModal] = useDisclosure(false);

    const { deleteAllPlatoon } = useDeleteAllPlatoons();
    const { transferToTheNextYear, transferToPrevYear } = useTransferToTheNextYear();

    const confirmDeleteData = async () => {
        if (deleteInput == quantityPlatoons) {
            await deleteAllPlatoon();
            navigate('/')
            window.location.reload();
        } else {
            setDeleteError('Неверно введёно кол-во взводов. Удаление данных отменено.');
        }
    }

    const handleTransferToNextYear = async () => {
        setTransferLoading(true);
        setTransferError("");

        try {
            const result = await transferToTheNextYear();

            if (result.success) {
                // Показываем успешное сообщение и перезагружаем данные
                alert(result.message || 'Перевод на следующий год выполнен успешно!');
                navigate('/');
                window.location.reload(); // Перезагружаем страницу для обновления данных
            } else {
                setTransferError(result.error || 'Произошла неизвестная ошибка');
            }
        } catch (error) {
            setTransferError(`Ошибка: ${error.message}`);
        } finally {
            setTransferLoading(false);
        }
    }

    const handleTransferToPrevYear = async () => {
        setTransferLoading(true);
        setTransferError("");

        try {
            const result = await transferToPrevYear();

            if (result.success) {
                // Показываем успешное сообщение и перезагружаем данные
                alert(result.message || 'Перевод на прошлый год выполнен успешно!');
                navigate('/');
                window.location.reload(); // Перезагружаем страницу для обновления данных
            } else {
                setTransferError(result.error || 'Произошла неизвестная ошибка');
            }
        } catch (error) {
            setTransferError(`Ошибка: ${error.message}`);
        } finally {
            setTransferLoading(false);
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
                        <Text>Полностью удалить взвода и очистить архив</Text>
                        <Button
                            onClick={confirmDeleteModal.open}
                            disabled={transferLoading || quantityPlatoons === 0}
                        >
                            <FaTrash />
                        </Button>
                    </Group>

                    <Group justify="space-between">
                        <Text>Перевести взвода и студентов на СЛЕДУЮЩИЙ год</Text>
                        <Button
                            onClick={handleTransferToNextYear}
                            disabled={transferLoading || quantityPlatoons === 0}
                        >
                            Перевести на следующий год
                        </Button>
                    </Group>

                    <Group justify="space-between">
                        <Text>Перевести взвода и студентов на ПРОШЛЫЙ год</Text>
                        <Button
                            onClick={handleTransferToPrevYear}
                            disabled={transferLoading || quantityPlatoons === 0}
                        >
                            Перевести на прошлый год
                        </Button>
                    </Group>

                    {transferError && (
                        <Text c="red" size="sm">
                            Ошибка перевода: {transferError}
                        </Text>
                    )}
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