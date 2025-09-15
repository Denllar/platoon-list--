const { app, BrowserWindow, screen, ipcMain } = require('electron/main')
const path = require('path')
const { getAllPlatoons,
  getPlatoonById,
  addPlatoon,
  updatePlatoon,
  deletePlatoon } = require('./hooks.cjs');

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
ipcMain.handle('get-all-data', async () => {
  return getAllPlatoons();
});

ipcMain.handle('get-data-by-id', async (event, id) => {
  return getPlatoonById(id);
});

ipcMain.handle('add-data', async (event, data) => {
  return addPlatoon(data);
});

ipcMain.handle('update-data', async (event, id, data) => {
  return updatePlatoon(id, data);
});

ipcMain.handle('delete-data', async (event, id) => {
  return deletePlatoon(id);
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