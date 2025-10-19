export default function useUpdatePlatoon() {
    const updatePlatoon = async (id, updatedPlatoon) => {
        const { data } = await window.electronAPI.updatePlatoon(id, updatedPlatoon);
        return {
            data,
        }
    }

    return {
        updatePlatoon,
    }
}