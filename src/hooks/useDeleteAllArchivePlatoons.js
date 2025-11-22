export default function useDeleteAllArchivePlatoons() {
    const deleteAllArchivePlatoon = async () => {
        const result = await window.electronAPI.deleteAllArchivedPlatoons();
        console.log(result);
        
        return result;
    };

    return {
        deleteAllArchivePlatoon,
    };
}
