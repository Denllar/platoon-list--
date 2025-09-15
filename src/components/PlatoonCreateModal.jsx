import { useState } from "react";
import { Dialog, Button, Group, Input, Modal, Select, Stack, Text } from "@mantine/core";
import { TYPE_PLATOONS } from "../consts";
import { useDisclosure } from "@mantine/hooks";
import useAddPlatoon from "../hooks/useAddPlatoon";

export default function PlatoonCreateModal({
    opened,
    close,
}) {
    const [openedDialog, { toggle: openDialog, close: closeDialog }] = useDisclosure(false);
    const [typePlatoon, setTypePlatoon] = useState(null);
    const [numberPlatoon, setNumberPlatoon] = useState(null);
    
    const { addPlatoon: createPlatoon, } = useAddPlatoon();

    const onCloseModal = () => {
        setTypePlatoon(null);
        setNumberPlatoon(null);
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
    }
    
    return (
        <>
            <Modal
                opened={opened}
                onClose={onCloseModal}
                title={'Добавить взвод'}
                centered
                closeOnClickOutside={false}
            >
                <Stack>
                    <Group>
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
                        />
                    </Group>
                    <Button
                        onClick={addPlatoon}
                        disabled={!typePlatoon || !numberPlatoon}
                    >
                        Добавить
                    </Button>
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