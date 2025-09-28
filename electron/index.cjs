const { app, BrowserWindow, screen, ipcMain } = require('electron/main')
const path = require('path')
const { 
  getAllPlatoons,
  getPlatoonById,
  addPlatoon,
  updatePlatoon,
  deletePlatoon } = require('./platoonHooks.cjs');

  const { 
    getAllStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent } = require('./studentHooks.cjs');

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    width: width,
    height: height,
    title: 'Список Взводов',
    icon: path.join(__dirname, '../dist/ВУЦ.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  win.webContents.openDevTools()
  win.maximize();

  win.loadURL('http://localhost:5173');
  //win.loadFile(path.join(__dirname, '../dist/index.html'));
}

// IPC обработчики

// Взвод
ipcMain.handle('get-all-platoon', async () => {
  return getAllPlatoons();
});

ipcMain.handle('get-platoon-by-id', async (event, id) => {
  return getPlatoonById(id);
});

ipcMain.handle('add-platoon', async (event, data) => {
  return addPlatoon(data);
});

ipcMain.handle('update-platoon', async (event, id, data) => {
  return updatePlatoon(id, data);
});

ipcMain.handle('delete-platoon', async (event, id) => {
  return deletePlatoon(id);
});

// Студент
ipcMain.handle('get-all-students', async (event, platoonId) => {
  return getAllStudents(platoonId);
});

ipcMain.handle('get-student-by-id', async (event, id) => {
  return getStudentById(id);
});

ipcMain.handle('add-student', async (event, student) => {
  return addStudent(student);
});

ipcMain.handle('update-student', async (event, id, student) => {
  return updateStudent(id, student);
});

ipcMain.handle('delete-student', async (event, id) => {
  return deleteStudent(id);
});

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})