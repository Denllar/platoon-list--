import { createPlatoonStore, store } from "../models/PlatoonSchema";
import { PLATOONS } from "../consts";

export const getPlatoons = () => {
    store.get(PLATOONS, []);
}

export const createPlatoon = (platoonData) => {
    const platoons = getPlatoons();
    const newPlatoon = createPlatoonStore(platoonData);

    const updatedPlatoons = [...platoons, newPlatoon];
    store.set(PLATOONS, updatedPlatoons);
    
    return newPlatoon;
}