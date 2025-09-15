// src/hooks/useGetPlatoonById.js
import { useEffect, useState } from "react";

export default function useGetPlatoonById(id) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;
        window.electronAPI.getPlatoonById(id)
            .then(({ data }) => setData(data))
            .catch(setError);
    }, [id]);

    return { data, error };
}