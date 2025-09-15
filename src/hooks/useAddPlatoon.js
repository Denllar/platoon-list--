export default function useAddPlatoon() {
    const addPlatoon = async (platoonObject) => {
        const {data, error} = await window.electronAPI.addData(platoonObject);
        return {data, error};
    }

    return {
        addPlatoon,
    }
}