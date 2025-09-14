import { useState, useId } from "react";
import { Button, Group, Input, Modal, Select, Stack } from "@mantine/core";
//import { store } from "../models/PlatoonSchema";

export default function PlatoonCreateModal({
    opened,
    close,
}) {
    const platoonId = useId();
    const [typePlatoon, setTypePlatoon] = useState(null);
    const [numberPlatoon, setNumberPlatoon] = useState(null);

    const onCloseModal = () => {
        setTypePlatoon(null);
        setNumberPlatoon(null);
        close();
    }

    const addPlatoon = async () => {
        const platoonObject = {
            id: platoonId,
            type: typePlatoon,
            number: numberPlatoon,
        }

        try {
            if (!window.platoonAPI) {
                throw new Error('Platoon API не доступен');
            }
            await window.platoonAPI.createPlatoon(platoonObject);
            onCloseModal();
        } catch (error) {
            console.error('Ошибка создания взвода:', error);
        }
    }

    return (
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
                        data={['Кадровые', 'Офицеры', 'Солдаты',]}
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
    );
}