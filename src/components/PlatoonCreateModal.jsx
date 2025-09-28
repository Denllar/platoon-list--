import { useEffect, useState } from "react";
import { Dialog, Button, Group, Input, Modal, Select, Stack, Text, CloseButton } from "@mantine/core";
import { TYPE_PLATOONS } from "../consts";
import { useDisclosure } from "@mantine/hooks";
import useAddPlatoon from "../hooks/useAddPlatoon";
import useUpdatePlatoon from "../hooks/useUpdatePlatoon";
import { useNavigate } from "react-router-dom";

export default function PlatoonCreateModal({
    opened,
    close,
    editPlatoon,
    setEditPlatoon,
}) {
    const navigate = useNavigate();

    const [openedDialog, { toggle: openDialog, close: closeDialog }] = useDisclosure(false);
    const [typePlatoon, setTypePlatoon] = useState(editPlatoon.type || "");
    const [numberPlatoon, setNumberPlatoon] = useState(editPlatoon.number || "");
    const disabledButtonAdd = !typePlatoon || !numberPlatoon;
    const editButtonDisabled = disabledButtonAdd || (typePlatoon === editPlatoon.type && numberPlatoon === editPlatoon.number);

    const { createPlatoon } = useAddPlatoon();
    const { updatePlatoon } = useUpdatePlatoon();

    const onCloseModal = () => {
        setTypePlatoon(null);
        setNumberPlatoon(null);
        setEditPlatoon({});
        close();
    }

    const addPlatoon = async () => {
        const platoonObject = {
            id: Date.now().toString(),
            type: typePlatoon,
            number: numberPlatoon,
        }
        const { error: addError } = await createPlatoon(platoonObject);
        if (addError) {
            openDialog();
            return;
        }
        onCloseModal();
        navigate(`/${platoonObject.id}`)
        window.location.reload();
    }

    const handleEditPlatoon =() => {
        updatePlatoon(editPlatoon.id, {type: typePlatoon, number: numberPlatoon});

        onCloseModal();
        window.location.reload();
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