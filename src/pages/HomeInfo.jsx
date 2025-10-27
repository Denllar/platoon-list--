import { Text, Group, Stack, Button, Dialog } from "@mantine/core";
import useImportPlatoonsWord from "../hooks/useImportPlatoonsWord";
import { useDisclosure } from "@mantine/hooks";

function HomeInfo() {
  const [openedDialog, { toggle: openDialog, close: closeDialog }] = useDisclosure(false);
  const { importFromWord, importStatus } = useImportPlatoonsWord();

  return (
    <Group h="100%" px="md" justify="center">
      <Stack align="center">
        <Text >Выберите взвод</Text>
        <Text >или</Text>
        <Button
          component="label"
        >
          Импорт из Word
          <input
            type="file"
            hidden
            //accept=".docx"
            onChange={(e) => {
              importFromWord(e);
              openDialog();
            }}
          />
        </Button>
        {/* {importStatus && <Text c="yellow" fw={700}>{importStatus}</Text>} */}
      </Stack>

      <Dialog opened={openedDialog} withCloseButton onClose={closeDialog} size="lg" radius="md">
        <Text size="sm" mb="xs" fw={500}>
          {importStatus}
        </Text>
      </Dialog>
    </Group>
  );
}

export default HomeInfo;
