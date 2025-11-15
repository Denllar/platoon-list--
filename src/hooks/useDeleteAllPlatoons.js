export default function useDeleteAllPlatoons() {
    const deleteAllPlatoon = async () => {
        const result = await window.electronAPI.deleteAllPlatoons();
        return result;
    };

    return {
        deleteAllPlatoon,
    };
}
