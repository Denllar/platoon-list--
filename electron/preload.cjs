const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAllPlatoons: () => ipcRenderer.invoke('get-all-data'),
    getPlatoonById: (id) => ipcRenderer.invoke('get-data-by-id', id),
    addPlatoon: (data) => ipcRenderer.invoke('add-data', data),
    updatePlatoon: (id, data) => ipcRenderer.invoke('update-data', id, data),
    deletePlatoon: (id) => ipcRenderer.invoke('delete-data', id)
});