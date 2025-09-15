import { Group, Stack, Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import useGetPlatoonById from "../hooks/useGetPlatoonById"

export default function PlatoonTable() {
    const { id } = useParams();
    const { data } = useGetPlatoonById(id);
    console.log(data);
    
    return (
        <Stack p={'xs'} style={{ flex: '1', height: '100%' }} bg={'blue'}>
            <Group>
                <Stack c={'white'}>
                    <Text>{data?.type}</Text>
                    <Text>Взвод {data?.number}</Text>
                </Stack>
            </Group>
        </Stack>
    );
}