import { useState } from "react";

export default function useGetStudents({setStudents}) {
    const [error, setError] = useState(null);

    const getStudents = async (platoonId) => {
        try {
            const { data, error } = await window.electronAPI.getAllStudents(platoonId);
            setStudents((data || []).sort((a, b) => a.fio.localeCompare(b.fio)));
            setError(error || null);
        } catch (e) {
            setError(e);
        }
    };

    return {
        getStudents,
        error,
    };
}
