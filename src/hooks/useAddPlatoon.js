export default function useAddPlatoon() {
    const createPlatoon = async (platoonObject) => {
        const {data, error} = await window.electronAPI.addPlatoon(platoonObject);
        return {data, error};
    }

    return {
        createPlatoon,
    }
}