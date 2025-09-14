import { useState } from "react";
import { Button, Group, Input, Modal, Select, Stack } from "@mantine/core";

export default function PlatoonCreateModal({
    opened,
    close,
}) {
    const [typePlatoon, setTypePlatoon] = useState(null);
    const [numberPlatoon, setNumberPlatoon] = useState(null);

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
        const { data, error } = await window.electronAPI.addData(platoonObject);
        console.log(data);

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