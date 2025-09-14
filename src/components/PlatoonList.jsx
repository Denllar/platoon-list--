import { Menu, Button, Group, ScrollArea, Stack, Text } from "@mantine/core";
import PlatoonAddModal from "./PlatoonCreateModal";
import { useDisclosure } from "@mantine/hooks";

export default function PlatoonList() {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <Stack align="center" p={'xs'}>
            <ScrollArea>
                <Group>
                    <Text>Список взводов</Text>
                    <Button variant="outline" px={'xs'} py={0} onClick={open}>
                        +
                    </Button>
                    <PlatoonAddModal
                        opened={opened}
                        close={close}
                    />
                </Group>
            </ScrollArea>
        </Stack>
    );
}