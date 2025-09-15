import { useState } from "react";

export default function useGetPlatoons() {
    const [platoons, setPlatoons] = useState([]);

    const getPlatoons = async () => {
        const {data} = await window.electronAPI.getAllPlatoons();
        setPlatoons(data);
    }

    return {
        getPlatoons,
        platoons,
    }
}