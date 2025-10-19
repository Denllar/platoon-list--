export default function useGetPlatoons({setPlatoons}) {

    const getPlatoons = async () => {
        const {data} = await window.electronAPI.getAllPlatoons();
        setPlatoons(data);
    }

    return {
        getPlatoons,
    }
}