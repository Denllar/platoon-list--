const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('platoonAPI', {
  getPlatoons: () => ipcRenderer.invoke('get-platoons'),
  createPlatoon: (platoonData) => ipcRenderer.invoke('create-platoon', platoonData)
});