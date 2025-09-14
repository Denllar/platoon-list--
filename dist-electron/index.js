import require$$0 from "electron/main";
import require$$1 from "path";
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var electron = {};
var hasRequiredElectron;
function requireElectron() {
  if (hasRequiredElectron) return electron;
  hasRequiredElectron = 1;
  const { app, BrowserWindow, screen, nativeImage } = require$$0;
  const path = require$$1;
  const createWindow = () => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const win = new BrowserWindow({
      width,
      height,
      title: "Список Взводов",
      icon: path.join(__dirname, "../dist/ВУЦ.png")
    });
    win.maximize();
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  };
  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  return electron;
}
var electronExports = requireElectron();
const index = /* @__PURE__ */ getDefaultExportFromCjs(electronExports);
export {
  index as default
};
