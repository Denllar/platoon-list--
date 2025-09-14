const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAllData: () => ipcRenderer.invoke('get-all-data'),
    getDataById: (id) => ipcRenderer.invoke('get-data-by-id', id),
    addData: (data) => ipcRenderer.invoke('add-data', data),
    updateData: (id, data) => ipcRenderer.invoke('update-data', id, data),
    deleteData: (id) => ipcRenderer.invoke('delete-data', id)
});