const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAllPlatoons: () => ipcRenderer.invoke('get-all-platoon'),
    getPlatoonById: (id) => ipcRenderer.invoke('get-platoon-by-id', id),
    addPlatoon: (data) => ipcRenderer.invoke('add-platoon', data),
    updatePlatoon: (id, data) => ipcRenderer.invoke('update-platoon', id, data),
    deletePlatoon: (id) => ipcRenderer.invoke('delete-platoon', id),

    getAllStudents: (platoonId) => ipcRenderer.invoke('get-all-students', platoonId),
    getStudentById: (id) => ipcRenderer.invoke('get-student-by-id', id),
    addStudent: (student) => ipcRenderer.invoke('add-student', student),
    updateStudent: (id, student) => ipcRenderer.invoke('update-student', id, student),
    deleteStudent: (id) => ipcRenderer.invoke('delete-student', id),
});