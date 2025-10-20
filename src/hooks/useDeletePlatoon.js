export default function useDeletePlatoon() {
    const deletePlatoon = async (id) => {
        const result = await window.electronAPI.deletePlatoon(id);
        return result;
    };

    return {
        deletePlatoon,
    };
}
