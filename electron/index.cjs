const { app, BrowserWindow, screen, ipcMain } = require('electron/main')
const path = require('path')

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    width: width,
    height: height,
    title: 'Список Взводов',
    icon: path.join(__dirname, '../dist/ВУЦ.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  win.maximize();
  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(async() => {
  const { getPlatoons, createPlatoon } = require('../src/hooks/usePlatoon');

  ipcMain.handle('get-platoons', () => {
    return getPlatoons();
  });

  ipcMain.handle('create-platoon', (platoonData) => {
    return createPlatoon(platoonData);
  });

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